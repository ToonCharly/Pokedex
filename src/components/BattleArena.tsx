import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { Pokemon } from "../types/pokemon";
import "../styles/battle-arena.css";

interface BattleArenaProps {
  trainerName: string;
  playerNumber: 1 | 2;
  team: Pokemon[];
  onExit: () => void;
}

interface BattleState {
  player1: {
    name: string;
    pokemon: Pokemon | null;
    hp: number;
    maxHp: number;
  };
  player2: {
    name: string;
    pokemon: Pokemon | null;
    hp: number;
    maxHp: number;
  };
  turn: 1 | 2;
  log: string[];
  winner: string | null;
}

export function BattleArena({ trainerName, playerNumber, team, onExit }: BattleArenaProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [waiting, setWaiting] = useState(true);
  const [selectedMove, setSelectedMove] = useState<string | null>(null);

  useEffect(() => {
    // Conectar al servidor Socket.io
    const newSocket = io("http://localhost:3001");
    
    newSocket.on("connect", () => {
      console.log("Conectado al servidor");
      newSocket.emit("joinBattle", { trainerName, playerNumber });
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

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [trainerName, playerNumber]);

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
    if (socket) {
      socket.disconnect();
    }
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
    return (
      <div className="battle-arena">
        <div className="pokemon-selection">
          <h2>ELIGE TU POKEMON</h2>
          <div className="selection-grid">
            {team.map((pokemon, index) => (
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
        </div>
      </div>
    );
  }

  const isMyTurn = battleState.turn === playerNumber;
  const myState = playerNumber === 1 ? battleState.player1 : battleState.player2;
  const opponentState = playerNumber === 1 ? battleState.player2 : battleState.player1;

  const moves = ["Placaje", "Rayo", "Ascuas", "Pistola Agua"];

  return (
    <div className="battle-arena">
      {battleState.winner && (
        <div className="winner-overlay">
          <h1>¡{battleState.winner} GANA!</h1>
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
                {moves.map((move) => (
                  <button
                    key={move}
                    onClick={() => attack(move)}
                    className="move-btn"
                    disabled={!!selectedMove}
                  >
                    {move}
                  </button>
                ))}
              </div>
            </>
          ) : (
            !battleState.winner && <p className="turn-indicator">TURNO DEL OPONENTE...</p>
          )}
        </div>
      </div>
    </div>
  );
}
