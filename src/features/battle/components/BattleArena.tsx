import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { Pokemon, BattleState } from "../../../shared/models";
import { loadTeamData } from "../../../shared/utils";
import "../styles/battle-arena.css";

interface BattleArenaProps {
  trainerName: string;
  playerNumber: 1 | 2;
  team: Pokemon[];
  battleMode: number;
  onExit: () => void;
}

export function BattleArena({ trainerName, playerNumber, team, battleMode, onExit }: BattleArenaProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Restaurar estado de batalla desde sessionStorage si existe
  const [battleState, setBattleState] = useState<BattleState | null>(() => {
    const saved = sessionStorage.getItem('battleState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.battleState;
      } catch {
        sessionStorage.removeItem('battleState');
        return null;
      }
    }
    return null;
  });

  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(() => {
    const saved = sessionStorage.getItem('battleState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.selectedPokemon;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [waiting, setWaiting] = useState(() => {
    const saved = sessionStorage.getItem('battleState');
    return !saved; // Si hay estado guardado, no esperamos
  });

  const [selectedMove, setSelectedMove] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Cargar equipo desde localStorage si está vacío
  const actualTeam = team.length === 0 ? (() => {
    const savedData = loadTeamData();
    const loadedTeam = savedData.team.map(t => t.pokemon);
    console.log("Equipo cargado desde localStorage:", loadedTeam);
    return loadedTeam;
  })() : team;

  // Guardar estado de batalla en sessionStorage para persistencia
  useEffect(() => {
    if (battleState && selectedPokemon) {
      sessionStorage.setItem('battleState', JSON.stringify({
        battleState,
        selectedPokemon,
        trainerName,
        playerNumber,
      }));
    }
  }, [battleState, selectedPokemon, trainerName, playerNumber]);

  useEffect(() => {
    // Conectar al servidor Socket.io usando variable de entorno
    const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";
    const newSocket = io(serverUrl);
    
    newSocket.on("connect", () => {
      console.log("Conectado al servidor");
      // Si hay una batalla guardada, reconectar a ella
      const savedBattleState = sessionStorage.getItem('battleState');
      if (savedBattleState) {
        console.log("Reconectando a batalla existente...");
        newSocket.emit("rejoinBattle", { trainerName, playerNumber });
      } else {
        newSocket.emit("joinBattle", { 
          trainerName, 
          playerNumber, 
          team: actualTeam,
          battleMode 
        });
      }
    });

    newSocket.on("waitingForOpponent", () => {
      setWaiting(true);
    });

    newSocket.on("battleStart", (state: BattleState) => {
      console.log("Batalla iniciada", state);
      setWaiting(false);
      setBattleState(state);
    });

    newSocket.on("battleUpdate", (state: BattleState) => {
      console.log("Estado actualizado", state);
      setBattleState(state);
      setSelectedMove(null);
    });

    newSocket.on("battleEnd", (state: BattleState) => {
      console.log("Batalla terminada", state);
      setBattleState(state);
    });

    newSocket.on("opponentDisconnected", () => {
      console.log("El oponente se desconectó");
      // El oponente se salió, ganaste
      setBattleState(prevState => {
        if (!prevState) return null;
        const winner = playerNumber === 1 ? prevState.player1.name : prevState.player2.name;
        return {
          ...prevState,
          winner: winner,
          log: [...prevState.log, "¡El otro jugador se salió de la partida!", `¡${winner} gana!`]
        };
      });
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [trainerName, playerNumber, actualTeam, battleMode]);

  const selectPokemon = (pokemon: Pokemon) => {
    if (!socket || selectedPokemon) return;
    setSelectedPokemon(pokemon);
    socket.emit("selectPokemon", { playerNumber, pokemon });
  };

  const attack = (moveName: string) => {
    if (!socket || !battleState || battleState.turn !== playerNumber || selectedMove) return;
    setSelectedMove(moveName);
    socket.emit("attack", { playerNumber, moveName });
  };

  const handleExit = () => {
    // Si ya hay un ganador, salir directamente sin confirmación
    if (battleState?.winner) {
      if (socket) {
        socket.disconnect();
      }
      sessionStorage.removeItem('battleState');
      onExit();
      return;
    }

    // Si la batalla está en curso, mostrar modal de confirmación
    setShowExitConfirm(true);
  };

  const handleConfirmExit = () => {
    if (socket) {
      socket.disconnect();
    }
    sessionStorage.removeItem('battleState');
    setShowExitConfirm(false);
    onExit();
  };

  if (waiting) {
    return (
      <div className="battle-arena">
        <div className="waiting-screen">
          <h2>ESPERANDO OPONENTE...</h2>
          <div className="waiting-spinner"></div>
          <p>Jugador {playerNumber}: {trainerName}</p>
          <button onClick={handleExit} className="exit-battle-btn">
            SALIR
          </button>
        </div>
      </div>
    );
  }

  if (!battleState) {
    return <div className="battle-arena">Cargando batalla...</div>;
  }

  if (!selectedPokemon) {
    console.log("Equipo disponible:", actualTeam);
    console.log("Cantidad de Pokemon:", actualTeam.length);
    
    return (
      <div className="battle-arena">
        <div className="pokemon-selection">
          <h2>ELIGE TU POKEMON</h2>
          {actualTeam.length === 0 ? (
            <p style={{ color: 'white', fontSize: '12px', textAlign: 'center' }}>
              No tienes Pokémon en tu equipo. Agrega algunos primero.
            </p>
          ) : (
            <div className="selection-grid">
              {actualTeam.map((pokemon, index) => (
                <div
                  key={index}
                  className="pokemon-card"
                  onClick={() => selectPokemon(pokemon)}
                >
                  <img src={pokemon.frontImage} alt={pokemon.name} />
                  <span className="pokemon-card-name">{pokemon.nickname}</span>
                  <span className="pokemon-card-hp">
                    HP: {pokemon.stats.find(s => s.name === "hp")?.total || 100}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const isMyTurn = battleState.turn === playerNumber;
  const myState = playerNumber === 1 ? battleState.player1 : battleState.player2;
  const opponentState = playerNumber === 1 ? battleState.player2 : battleState.player1;

  // Obtener movimientos del Pokémon actual - con fallback a movimientos por defecto
  const defaultMoves = [
    { name: "Placaje", power: 40, accuracy: 100, type: "normal" },
    { name: "Rayo", power: 90, accuracy: 100, type: "electric" },
    { name: "Ascuas", power: 40, accuracy: 100, type: "fire" },
    { name: "Pistola Agua", power: 40, accuracy: 100, type: "water" },
  ];
  
  const availableMoves = selectedPokemon?.moves && selectedPokemon.moves.length > 0 
    ? selectedPokemon.moves 
    : defaultMoves;

  console.log("Pokémon seleccionado:", selectedPokemon?.name, "Movimientos:", availableMoves);

  const didIWin = battleState.winner === trainerName;
  const opponentLeft = battleState.log.some(msg => msg.includes("se salió de la partida"));
  const winnerMessage = battleState.winner 
    ? (didIWin ? "¡GANASTE LA BATALLA!" : "¡PERDISTE LA BATALLA!")
    : "";

  return (
    <div className="battle-arena">
      {battleState.winner && (
        <div className="winner-overlay">
          {didIWin && opponentLeft && (
            <p className="opponent-left-message">El otro jugador se salió de la partida</p>
          )}
          <h1>{winnerMessage}</h1>
          {didIWin && <p className="congratulations">Felicidades!!!!!!</p>}
          <p className="winner-name">{battleState.winner}</p>
          <button onClick={handleExit} className="exit-battle-btn">
            SALIR
          </button>
        </div>
      )}

      <div className="battle-field">
        {/* Oponente */}
        <div className="battle-side opponent">
          <div className="trainer-info">
            <span className="trainer-name">{opponentState.name}</span>
            <span className="remaining-pokemon">Pokémon: {opponentState.remainingPokemon || 0}</span>
          </div>
          {opponentState.pokemon && (
            <div className="pokemon-display">
              <img 
                src={opponentState.pokemon.frontImage} 
                alt={opponentState.pokemon.name}
                className="pokemon-sprite opponent-sprite"
              />
              <div className="pokemon-info-box">
                <span className="pokemon-name">{opponentState.pokemon.nickname}</span>
                <div className="hp-bar-container">
                  <div 
                    className="hp-bar"
                    style={{ width: `${(opponentState.hp / opponentState.maxHp) * 100}%` }}
                  ></div>
                </div>
                <span className="hp-text">
                  HP: {opponentState.hp}/{opponentState.maxHp}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Jugador */}
        <div className="battle-side player">
          {myState.pokemon && (
            <div className="pokemon-display">
              <div className="pokemon-info-box">
                <span className="pokemon-name">{myState.pokemon.nickname}</span>
                <div className="hp-bar-container">
                  <div 
                    className="hp-bar player-hp"
                    style={{ width: `${(myState.hp / myState.maxHp) * 100}%` }}
                  ></div>
                </div>
                <span className="hp-text">
                  HP: {myState.hp}/{myState.maxHp}
                </span>
              </div>
              <img 
                src={myState.pokemon.backImage} 
                alt={myState.pokemon.name}
                className="pokemon-sprite player-sprite"
              />
            </div>
          )}
          <div className="trainer-info">
            <span className="trainer-name">{myState.name}</span>
            <span className="remaining-pokemon">Pokémon: {myState.remainingPokemon || 0}</span>
          </div>
        </div>
      </div>

      {/* Panel de control */}
      <div className="battle-controls">
        <div className="battle-log">
          {battleState.log.slice(-3).map((entry, index) => (
            <p key={index} className="log-entry">{entry}</p>
          ))}
        </div>

        <div className="move-buttons">
          {isMyTurn && !battleState.winner ? (
            <>
              <p className="turn-indicator">¡TU TURNO!</p>
              <div className="moves-grid">
                {availableMoves.map((move) => (
                  <button
                    key={move.name}
                    onClick={() => attack(move.name)}
                    className="move-btn"
                    disabled={!!selectedMove}
                    title={`${move.type} - Poder: ${move.power}`}
                  >
                    {move.name}
                  </button>
                ))}
              </div>
            </>
          ) : (
            !battleState.winner && <p className="turn-indicator">TURNO DEL OPONENTE...</p>
          )}
          {!battleState.winner && (
            <button onClick={handleExit} className="exit-battle-btn" style={{ marginTop: '10px' }}>
              SALIR DE BATALLA
            </button>
          )}
        </div>
      </div>

      {/* Exit Confirm Modal - Pokemon style */}
      {showExitConfirm && (
        <div className="pokemon-modal-overlay">
          <div className="pokemon-modal">
            <div className="pokemon-modal-text">
              ¿Estás seguro de que quieres salir de la batalla?
            </div>
            <div className="pokemon-modal-buttons">
              <button onClick={handleConfirmExit}>SÍ</button>
              <button onClick={() => setShowExitConfirm(false)}>NO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
