const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST"]
  }
});

// Estado del juego
let waitingRoom = {
  player1: null,
  player2: null
};

// Guardar batalla activa por nombre de entrenador/playerNumber
let activeBattles = new Map(); // key: "player1:nombre" o "player2:nombre"
let battles = new Map();

// Calcular daño
function calculateDamage(attackerPokemon, defenderPokemon, moveName) {
  const defaultMoves = {
    "Placaje": { power: 40, type: "normal" },
    "Rayo": { power: 90, type: "electric" },
    "Ascuas": { power: 40, type: "fire" },
    "Pistola Agua": { power: 40, type: "water" }
  };

  // Buscar movimiento en los stats del Pokémon o usar default
  let move = defaultMoves[moveName];
  
  if (!move && attackerPokemon.moves) {
    const pokemonMove = attackerPokemon.moves.find(m => m.name === moveName);
    if (pokemonMove) {
      move = { power: pokemonMove.power, type: pokemonMove.type };
    }
  }
  
  move = move || defaultMoves["Placaje"];
  const attackStat = attackerPokemon.stats.find(s => s.name === "attack")?.total || 50;
  const defenseStat = defenderPokemon.stats.find(s => s.name === "defense")?.total || 50;
  
  // Fórmula simplificada de daño Pokemon
  const level = 50;
  const random = 0.85 + Math.random() * 0.15; // 0.85 - 1.0
  const stab = 1.0; // Sin bonus de tipo por simplicidad
  const effectiveness = 1.0; // Sin ventajas de tipo por simplicidad
  
  const damage = Math.floor(
    ((((2 * level / 5) + 2) * move.power * (attackStat / defenseStat)) / 50 + 2) * 
    random * stab * effectiveness
  );
  
  return Math.max(1, damage);
}

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('joinBattle', ({ trainerName, playerNumber, team, battleMode }) => {
    console.log(`${trainerName} se unió como Jugador ${playerNumber} con modo ${battleMode || 1}v${battleMode || 1}`);
    
    const playerData = {
      socketId: socket.id,
      name: trainerName,
      team: team || [],
      battleMode: battleMode || 1,
      currentPokemonIndex: 0,
      pokemon: null,
      hp: 0,
      maxHp: 0
    };

    if (playerNumber === 1) {
      waitingRoom.player1 = playerData;
    } else {
      waitingRoom.player2 = playerData;
    }

    // Verificar si ambos jugadores están listos
    if (waitingRoom.player1 && waitingRoom.player2) {
      console.log('Ambos jugadores conectados, iniciando selección de Pokemon...');
      
      // Determinar el modo de batalla (modo libre = 0, o el menor de los dos)
      const finalBattleMode = waitingRoom.player1.battleMode === 0 || waitingRoom.player2.battleMode === 0
        ? 0 // Modo libre
        : Math.min(waitingRoom.player1.battleMode, waitingRoom.player2.battleMode);
      
      console.log(`Modo de batalla: ${finalBattleMode === 0 ? 'LIBRE' : finalBattleMode + 'v' + finalBattleMode}`);
      console.log(`Jugador 1: ${waitingRoom.player1.team.length} Pokémon`);
      console.log(`Jugador 2: ${waitingRoom.player2.team.length} Pokémon`);
      
      // Crear estado inicial de batalla para mostrar pantalla de selección
      const initialState = {
        player1: {
          name: waitingRoom.player1.name,
          pokemon: null,
          hp: 0,
          maxHp: 0
        },
        player2: {
          name: waitingRoom.player2.name,
          pokemon: null,
          hp: 0,
          maxHp: 0
        },
        battleMode: finalBattleMode,
        turn: 1,
        log: ['¡La batalla está por comenzar!', 'Seleccionen sus Pokemon...'],
        winner: null
      };
      
      // Emitir a ambos jugadores para que pasen a selección
      io.to(waitingRoom.player1.socketId).emit('battleStart', initialState);
      io.to(waitingRoom.player2.socketId).emit('battleStart', initialState);
    } else {
      socket.emit('waitingForOpponent');
    }
  });

  socket.on('rejoinBattle', ({ trainerName, playerNumber }) => {
    console.log(`${trainerName} reconectando como Jugador ${playerNumber}`);
    
    // Buscar batalla guardada
    const battleKey = `${playerNumber}:${trainerName}`;
    const savedBattle = activeBattles.get(battleKey);
    
    if (savedBattle) {
      console.log('Batalla encontrada, restaurando...');
      // Actualizar el socketId con la nueva conexión
      const playerData = playerNumber === 1 ? waitingRoom.player1 : waitingRoom.player2;
      if (playerData) {
        playerData.socketId = socket.id;
      }
      // Enviar estado actual de la batalla
      socket.emit('battleUpdate', savedBattle.battleState);
    } else {
      console.log('No se encontró batalla, comenzar nueva...');
      socket.emit('joinBattle', { trainerName, playerNumber });
    }
  });

  socket.on('selectPokemon', ({ playerNumber, pokemon }) => {
    console.log(`Jugador ${playerNumber} seleccionó:`, pokemon.name);
    
    const playerData = playerNumber === 1 ? waitingRoom.player1 : waitingRoom.player2;
    if (playerData && playerData.team.length > 0) {
      // Buscar el índice del Pokémon seleccionado en el equipo
      const selectedIndex = playerData.team.findIndex(p => 
        p.id === pokemon.id && p.nickname === pokemon.nickname
      );
      
      // Si se encuentra, usar ese índice; si no, usar el primero
      const pokemonIndex = selectedIndex >= 0 ? selectedIndex : 0;
      const selectedPokemon = playerData.team[pokemonIndex];
      
      playerData.pokemon = selectedPokemon;
      const hpStat = selectedPokemon.stats.find(s => s.name === "hp");
      playerData.hp = hpStat ? hpStat.total : 100;
      playerData.maxHp = playerData.hp;
      playerData.currentPokemonIndex = pokemonIndex;
      playerData.defeatedCount = 0;
      
      console.log(`Jugador ${playerNumber} comenzará con ${selectedPokemon.nickname} (índice ${pokemonIndex})`);
    }

    // Si ambos jugadores seleccionaron Pokemon, iniciar batalla
    if (waitingRoom.player1?.pokemon && waitingRoom.player2?.pokemon) {
      console.log('¡Batalla iniciada!');
      
      // Determinar el modo de batalla final
      const finalBattleMode = waitingRoom.player1.battleMode === 0 || waitingRoom.player2.battleMode === 0
        ? 0 // Modo libre
        : Math.min(waitingRoom.player1.battleMode, waitingRoom.player2.battleMode);
      
      const battleState = {
        player1: {
          name: waitingRoom.player1.name,
          pokemon: waitingRoom.player1.pokemon,
          hp: waitingRoom.player1.hp,
          maxHp: waitingRoom.player1.maxHp,
          remainingPokemon: waitingRoom.player1.team.length,
          currentIndex: 0
        },
        player2: {
          name: waitingRoom.player2.name,
          pokemon: waitingRoom.player2.pokemon,
          hp: waitingRoom.player2.hp,
          maxHp: waitingRoom.player2.maxHp,
          remainingPokemon: waitingRoom.player2.team.length,
          currentIndex: 0
        },
        battleMode: finalBattleMode,
        turn: 1,
        log: [
          `¡La batalla ha comenzado!`, 
          `${waitingRoom.player1.name} (${waitingRoom.player1.team.length}) vs ${waitingRoom.player2.name} (${waitingRoom.player2.team.length})!`, 
          `Modo: ${finalBattleMode === 0 ? 'LIBRE' : finalBattleMode + 'v' + finalBattleMode}`
        ],
        winner: null
      };

      // Enviar estado inicial a ambos jugadores
      io.to(waitingRoom.player1.socketId).emit('battleStart', battleState);
      io.to(waitingRoom.player2.socketId).emit('battleStart', battleState);

      // Guardar batalla
      battles.set('current', {
        state: battleState,
        player1Socket: waitingRoom.player1.socketId,
        player2Socket: waitingRoom.player2.socketId
      });
      
      // Guardar también en activeBattles para reconexiones
      activeBattles.set(`1:${waitingRoom.player1.name}`, { battleState });
      activeBattles.set(`2:${waitingRoom.player2.name}`, { battleState });
    }
  });

  socket.on('attack', ({ playerNumber, moveName }) => {
    const battle = battles.get('current');
    if (!battle) return;

    const state = battle.state;
    
    // Verificar que es el turno correcto
    if (state.turn !== playerNumber) return;
    
    const attacker = playerNumber === 1 ? state.player1 : state.player2;
    const defender = playerNumber === 1 ? state.player2 : state.player1;
    
    // Calcular daño
    const damage = calculateDamage(attacker.pokemon, defender.pokemon, moveName);
    defender.hp = Math.max(0, defender.hp - damage);
    
    // Actualizar log
    state.log.push(`${attacker.name} usó ${moveName}!`);
    state.log.push(`¡${defender.pokemon.nickname} recibió ${damage} de daño!`);
    
    // Verificar si el Pokémon fue derrotado
    if (defender.hp <= 0) {
      state.log.push(`¡${defender.pokemon.nickname} fue debilitado!`);
      
      // Reducir contador de Pokémon restantes
      defender.remainingPokemon--;
      
      // Verificar si hay más Pokémon disponibles
      const defenderData = playerNumber === 1 ? waitingRoom.player2 : waitingRoom.player1;
      const nextIndex = defender.currentIndex + 1;
      
      if (nextIndex < defenderData.team.length) {
        // Cambiar al siguiente Pokémon
        const nextPokemon = defenderData.team[nextIndex];
        defender.pokemon = nextPokemon;
        const hpStat = nextPokemon.stats.find(s => s.name === "hp");
        defender.hp = hpStat ? hpStat.total : 100;
        defender.maxHp = defender.hp;
        defender.currentIndex = nextIndex;
        
        state.log.push(`¡${attacker.name} envía a ${nextPokemon.nickname}!`);
        state.log.push(`Pokémon restantes: ${defender.remainingPokemon}`);
      } else {
        // No hay más Pokémon, el atacante gana
        state.winner = attacker.name;
        state.log.push(`¡${attacker.name} ganó la batalla!`);
        
        // Enviar estado final
        io.to(battle.player1Socket).emit('battleEnd', state);
        io.to(battle.player2Socket).emit('battleEnd', state);
        
        // Limpiar batalla
        battles.delete('current');
        activeBattles.delete(`1:${state.player1.name}`);
        activeBattles.delete(`2:${state.player2.name}`);
        waitingRoom = { player1: null, player2: null };
        return;
      }
    }
    
    // Cambiar turno
    state.turn = state.turn === 1 ? 2 : 1;
    state.log.push(`Turno de ${state.turn === 1 ? state.player1.name : state.player2.name}`);
    
    // Guardar estado actualizado en activeBattles
    activeBattles.set(`1:${state.player1.name}`, { battleState: state });
    activeBattles.set(`2:${state.player2.name}`, { battleState: state });
    
    // Enviar actualización
    io.to(battle.player1Socket).emit('battleUpdate', state);
    io.to(battle.player2Socket).emit('battleUpdate', state);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    
    // Limpiar waiting room si el jugador se desconecta
    if (waitingRoom.player1?.socketId === socket.id) {
      const player1Name = waitingRoom.player1.name;
      waitingRoom.player1 = null;
      // Limpiar activeBattles
      activeBattles.delete(`1:${player1Name}`);
      activeBattles.delete(`2:*`); // Limpiar el oponente también
    }
    if (waitingRoom.player2?.socketId === socket.id) {
      const player2Name = waitingRoom.player2.name;
      waitingRoom.player2 = null;
      // Limpiar activeBattles
      activeBattles.delete(`2:${player2Name}`);
      activeBattles.delete(`1:*`); // Limpiar el oponente también
    }
    
    // Notificar al otro jugador si hay una batalla activa
    const battle = battles.get('current');
    if (battle) {
      const otherSocket = battle.player1Socket === socket.id ? battle.player2Socket : battle.player1Socket;
      if (otherSocket) {
        io.to(otherSocket).emit('opponentDisconnected');
      }
      battles.delete('current');
      // Limpiar activeBattles también
      Array.from(activeBattles.keys()).forEach(key => {
        activeBattles.delete(key);
      });
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 Servidor Pokemon Battle iniciado en puerto ${PORT}`);
});
