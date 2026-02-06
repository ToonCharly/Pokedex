// shared/services/pokemon.service.ts
import type { 
  Pokemon, 
  PokemonApiResponse, 
  PokemonSpeciesResponse, 
  PokemonMove, 
  PokemonStat 
} from "../models";
import { 
  generateIV, 
  generateEV, 
  isShinyPokemon, 
  determineGender,
  getDefaultMoves
} from "../helpers";
import { POKEMON_API_BASE_URL, MAX_MOVES } from "../constants";

/**
 * Servicio para interactuar con la API de Pokémon
 */
export class PokemonService {
  /**
   * Obtiene los movimientos de un Pokémon (máximo 4)
   */
  static async loadPokemonMoves(pokemonId: number): Promise<PokemonMove[]> {
    try {
      const response = await fetch(`${POKEMON_API_BASE_URL}/pokemon/${pokemonId}`);
      const data: PokemonApiResponse = await response.json();

      const moves: PokemonMove[] = [];
      for (let i = 0; i < Math.min(MAX_MOVES, data.moves?.length || 0); i++) {
        const moveUrl = data.moves![i].move.url;
        const moveResponse = await fetch(moveUrl);
        const moveData = await moveResponse.json();
        
        moves.push({
          name: moveData.name.charAt(0).toUpperCase() + moveData.name.slice(1),
          power: moveData.power || 0,
          accuracy: moveData.accuracy || 100,
          type: moveData.type.name,
        });
      }
      return moves.length > 0 ? moves : getDefaultMoves();
    } catch (error) {
      console.error("Error loading moves:", error);
      return getDefaultMoves();
    }
  }

  /**
   * Selecciona los sprites correctos según género y shiny
   */
  static selectSprites(
    sprites: PokemonApiResponse['sprites'],
    gender: "male" | "female" | "genderless",
    isShiny: boolean
  ): { frontImage: string; backImage: string } {
    let frontImage: string;
    let backImage: string;

    if (gender === "female" && sprites.front_female) {
      frontImage = isShiny && sprites.front_shiny_female 
        ? sprites.front_shiny_female 
        : sprites.front_female;
      backImage = isShiny && sprites.back_shiny_female 
        ? sprites.back_shiny_female 
        : sprites.back_female || sprites.back_default;
    } else {
      frontImage = isShiny ? sprites.front_shiny : sprites.front_default;
      backImage = isShiny ? sprites.back_shiny : sprites.back_default;
    }

    return { frontImage, backImage };
  }

  /**
   * Procesa las estadísticas base del Pokémon
   */
  static processStats(
    baseStats: PokemonApiResponse['stats'],
    isShiny: boolean
  ): PokemonStat[] {
    return baseStats.map(s => {
      const iv = generateIV(isShiny);
      const ev = generateEV();
      return {
        name: s.stat.name,
        baseStat: s.base_stat,
        iv,
        ev,
        total: s.base_stat + iv + Math.floor(ev / 4),
      };
    });
  }

  /**
   * Carga un Pokémon completo desde la API
   */
  static async loadPokemon(pokemonId: number): Promise<Pokemon> {
    const response = await fetch(`${POKEMON_API_BASE_URL}/pokemon/${pokemonId}`);
    const data: PokemonApiResponse = await response.json();

    // Obtener datos de especie para gender rate
    const speciesResponse = await fetch(data.species.url);
    const speciesData: PokemonSpeciesResponse = await speciesResponse.json();

    const isShiny = isShinyPokemon();
    const gender = determineGender(speciesData.gender_rate);

    // Seleccionar sprites correctos
    const { frontImage, backImage } = this.selectSprites(data.sprites, gender, isShiny);

    // Cargar movimientos
    const moves = await this.loadPokemonMoves(pokemonId);

    // Procesar estadísticas
    const stats = this.processStats(data.stats, isShiny);

    return {
      id: data.id,
      name: data.name,
      nickname: data.name,
      frontImage,
      backImage,
      types: data.types.map(t => t.type.name),
      stats,
      isShiny,
      gender,
      height: data.height * 10, // convertir a cm
      weight: data.weight / 10, // convertir a kg
      moves,
    };
  }

  /**
   * Busca un Pokémon por nombre
   */
  static async searchPokemonByName(name: string): Promise<Pokemon> {
    const response = await fetch(`${POKEMON_API_BASE_URL}/pokemon/${name.toLowerCase()}`);
    if (!response.ok) {
      throw new Error("Pokémon no encontrado");
    }
    const data: PokemonApiResponse = await response.json();
    return this.loadPokemon(data.id);
  }
}
