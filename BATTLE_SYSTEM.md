# 🎮 Sistema de Batallas Pokemon Multijugador

Sistema completo de batallas Pokemon en tiempo real usando Socket.io para 2 jugadores en la misma computadora.

## 🚀 Cómo Usar

### 1. Iniciar el Servidor

Abre una terminal y ejecuta:

```bash
cd server
npm start
```

El servidor se iniciará en `http://localhost:3001`

### 2. Iniciar el Frontend

En otra terminal, ejecuta:

```bash
npm run dev
```

El frontend estará en `http://localhost:5173`

### 3. Empezar una Batalla

1. **Jugador 1:**
   - Abre el navegador en `http://localhost:5173`
   - Presiona el **círculo azul** en la Pokédex
   - Selecciona **"BATALLA"**
   - Ingresa tu nombre de entrenador
   - Selecciona **"JUGADOR 1"**
   - Elige tu Pokémon

2. **Jugador 2:**
   - Abre **otra pestaña** o ventana en `http://localhost:5173`
   - Repite los pasos pero selecciona **"JUGADOR 2"**
   - Elige tu Pokémon

3. ¡La batalla comenzará automáticamente cuando ambos hayan elegido su Pokémon!

## 🎯 Mecánicas de Batalla

### Sistema de Turnos
- Los jugadores se turnan para atacar
- Jugador 1 comienza primero
- No puedes atacar fuera de tu turno

### Movimientos Disponibles
- **Placaje**: 40 de poder (Normal)
- **Rayo**: 90 de poder (Eléctrico)
- **Ascuas**: 40 de poder (Fuego)
- **Pistola Agua**: 40 de poder (Agua)

### Cálculo de Daño
El sistema usa una fórmula simplificada basada en:
- Poder del movimiento
- Stats de Ataque del atacante
- Stats de Defensa del defensor
- Variación aleatoria (85%-100%)

### Condiciones de Victoria
- El primer Pokémon que llegue a 0 HP pierde
- El entrenador del Pokémon ganador es declarado vencedor

## 📁 Estructura del Proyecto

```
pokedex-react/
├── src/
│   ├── components/
│   │   ├── BattleArena.tsx       # Arena de batalla principal
│   │   ├── TrainerNameModal.tsx  # Modal para nombre de entrenador
│   │   ├── PokedexMenu.tsx       # Menú con opción de batalla
│   │   └── Pokedex.tsx           # Componente principal
│   ├── styles/
│   │   ├── battle-arena.css      # Estilos de batalla
│   │   └── trainer-modal.css     # Estilos del modal
│   └── types/
│       └── pokemon.ts            # Tipos de Pokemon
└── server/
    ├── server.js                 # Servidor Socket.io
    └── package.json              # Dependencias del servidor
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React** + **TypeScript**
- **Socket.io-client** - Comunicación en tiempo real
- **Vite** - Build tool

### Backend
- **Node.js** + **Express**
- **Socket.io** - WebSockets
- **CORS** - Configuración de seguridad

## 🎨 Características

✅ **Multijugador en tiempo real** - Sin delay  
✅ **Sistema de turnos justo** - Alternancia automática  
✅ **Cálculo de daño realista** - Basado en stats de Pokemon  
✅ **Interfaz retro** - Estilo Game Boy  
✅ **Animaciones fluidas** - Sprites animados  
✅ **Log de batalla** - Historial de acciones  
✅ **Sincronización perfecta** - Ambos jugadores ven lo mismo  

## 🐛 Solución de Problemas

### El servidor no inicia
```bash
cd server
npm install
npm start
```

### Error de conexión Socket.io
- Verifica que el servidor esté corriendo en puerto 3001
- Asegúrate que no haya otro proceso usando ese puerto

### Los jugadores no se conectan
- Ambos deben estar en la misma red/computadora
- Verifica que el frontend apunte a `http://localhost:3001`

### La batalla no inicia
- Asegúrate que ambos jugadores hayan seleccionado su Pokémon
- Revisa la consola del servidor para ver el estado

## 📝 Próximas Mejoras

- [ ] Más movimientos y tipos
- [ ] Sistema de ventajas de tipos (fuego > planta)
- [ ] Cambio de Pokémon durante batalla
- [ ] Efectos de estado (parálisis, quemadura, etc.)
- [ ] Ítems y pokeballs
- [ ] Sistema de niveles y experiencia
- [ ] Modo torneo para 4+ jugadores
- [ ] Guardado de estadísticas de batalla

## 🎮 Controles

- **Botón Azul Grande**: Abrir menú
- **BATALLA**: Iniciar batalla multijugador
- **Botones de Movimiento**: Atacar (solo en tu turno)
- **SALIR**: Abandonar batalla

## 💡 Tips

1. **Elige Pokemon con buenos stats** - Revisa HP, Ataque y Defensa
2. **Varía tus movimientos** - Cada uno tiene diferente poder
3. **Observa el HP del oponente** - Calcula cuántos ataques necesitas
4. **Los shiny no dan ventaja** - Son solo estéticos

---

**¡Disfruta las batallas Pokemon!** ⚡🔥💧🌿
