// shared/models/battle.model.ts
import type { Pokemon } from "./pokemon.model";

export interface BattleState {
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

export interface BattlePlayer {
  name: string;
  playerNumber: 1 | 2;
  team: Pokemon[];
}
