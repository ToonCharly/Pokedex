// core/config/app.config.ts

/**
 * Configuración centralizada de la aplicación
 */
export const AppConfig = {
  // API URLs
  api: {
    pokemon: "https://pokeapi.co/api/v2",
    battleServer: "http://localhost:3001",
  },
  
  // Configuración del juego
  game: {
    maxTeamSize: 6,
    maxMoves: 4,
    shinyRate: 1 / 4096,
    maxIV: 31,
    maxEV: 252,
  },
  
  // Storage keys
  storage: {
    teamData: "pokedex-team-data",
    backup: "pokedex-team-backup",
    battleState: "battleState",
  },
  
  // Configuración de características
  features: {
    autoSave: true,
    multiplayer: true,
  },
} as const;
