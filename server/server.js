const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Estado del juego
let waitingRoom = {
  player1: null,
  player2: null
};

let battles = new Map();

// Calcular daño
function calculateDamage(attackerPokemon, defenderPokemon, moveName) {
  const moves = {
    "Placaje": { power: 40, type: "normal" },
    "Rayo": { power: 90, type: "electric" },
    "Ascuas": { power: 40, type: "fire" },
    "Pistola Agua": { power: 40, type: "water" }
  };

  const move = moves[moveName] || moves["Placaje"];
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

  socket.on('joinBattle', ({ trainerName, playerNumber }) => {
    console.log(`${trainerName} se unió como Jugador ${playerNumber}`);
    
    const playerData = {
      socketId: socket.id,
      name: trainerName,
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
      console.log('Ambos jugadores conectados, esperando selección de Pokemon...');
    } else {
      socket.emit('waitingForOpponent');
    }
  });

  socket.on('selectPokemon', ({ playerNumber, pokemon }) => {
    console.log(`Jugador ${playerNumber} seleccionó:`, pokemon.name);
    
    const playerData = playerNumber === 1 ? waitingRoom.player1 : waitingRoom.player2;
    if (playerData) {
      playerData.pokemon = pokemon;
      const hpStat = pokemon.stats.find(s => s.name === "hp");
      playerData.hp = hpStat ? hpStat.total : 100;
      playerData.maxHp = playerData.hp;
    }

    // Si ambos jugadores seleccionaron Pokemon, iniciar batalla
    if (waitingRoom.player1?.pokemon && waitingRoom.player2?.pokemon) {
      console.log('¡Batalla iniciada!');
      
      const battleState = {
        player1: {
          name: waitingRoom.player1.name,
          pokemon: waitingRoom.player1.pokemon,
          hp: waitingRoom.player1.hp,
          maxHp: waitingRoom.player1.maxHp
        },
        player2: {
          name: waitingRoom.player2.name,
          pokemon: waitingRoom.player2.pokemon,
          hp: waitingRoom.player2.hp,
          maxHp: waitingRoom.player2.maxHp
        },
        turn: 1,
        log: [`¡La batalla ha comenzado!`, `${waitingRoom.player1.name} vs ${waitingRoom.player2.name}!`],
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
    
    // Verificar si hay ganador
    if (defender.hp <= 0) {
      state.log.push(`¡${defender.pokemon.nickname} fue debilitado!`);
      state.winner = attacker.name;
      
      // Enviar estado final
      io.to(battle.player1Socket).emit('battleEnd', state);
      io.to(battle.player2Socket).emit('battleEnd', state);
      
      // Limpiar batalla
      battles.delete('current');
      waitingRoom = { player1: null, player2: null };
      return;
    }
    
    // Cambiar turno
    state.turn = state.turn === 1 ? 2 : 1;
    state.log.push(`Turno de ${state.turn === 1 ? state.player1.name : state.player2.name}`);
    
    // Enviar actualización
    io.to(battle.player1Socket).emit('battleUpdate', state);
    io.to(battle.player2Socket).emit('battleUpdate', state);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    
    // Limpiar waiting room si el jugador se desconecta
    if (waitingRoom.player1?.socketId === socket.id) {
      waitingRoom.player1 = null;
    }
    if (waitingRoom.player2?.socketId === socket.id) {
      waitingRoom.player2 = null;
    }
    
    // Notificar al otro jugador si hay una batalla activa
    const battle = battles.get('current');
    if (battle) {
      const otherSocket = battle.player1Socket === socket.id ? battle.player2Socket : battle.player1Socket;
      if (otherSocket) {
        io.to(otherSocket).emit('opponentDisconnected');
      }
      battles.delete('current');
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🎮 Servidor Pokemon Battle iniciado en puerto ${PORT}`);
});
