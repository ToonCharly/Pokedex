// shared/helpers/pokemon.helpers.ts
import type { PokemonMove } from "../models";
import { SHINY_RATE, MAX_IV, MAX_EV } from "../constants";

/**
 * Genera un IV aleatorio (0-31)
 */
export const generateIV = (isShiny: boolean): number => {
  const baseIV = Math.floor(Math.random() * (MAX_IV + 1));
  return isShiny ? Math.min(MAX_IV, baseIV + 10) : baseIV;
};

/**
 * Genera EVs aleatorios (0-252)
 */
export const generateEV = (): number => Math.floor(Math.random() * (MAX_EV + 1));

/**
 * Determina si es shiny (1/4096 chance)
 */
export const isShinyPokemon = (): boolean => Math.random() < SHINY_RATE;

/**
 * Determina el género basado en gender_rate
 */
export const determineGender = (genderRate: number): "male" | "female" | "genderless" => {
  if (genderRate === -1) return "genderless";
  const femaleChance = genderRate / 8;
  return Math.random() < femaleChance ? "female" : "male";
};

/**
 * Movimientos por defecto si hay error
 */
export const getDefaultMoves = (): PokemonMove[] => [
  { name: "Placaje", power: 40, accuracy: 100, type: "normal" },
  { name: "Rayo", power: 90, accuracy: 100, type: "electric" },
  { name: "Ascuas", power: 40, accuracy: 100, type: "fire" },
  { name: "Pistola Agua", power: 40, accuracy: 100, type: "water" },
];

/**
 * Obtiene el símbolo de género
 */
export const getGenderSymbol = (gender: string): string => {
  if (gender === "male") return "♂";
  if (gender === "female") return "♀";
  return "⚲";
};
