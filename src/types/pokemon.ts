// types/pokemon.ts

export interface PokemonApiResponse {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny: string;
    back_shiny: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
  species: {
    url: string;
  };
}

export interface PokemonSpeciesResponse {
  gender_rate: number; // -1 = genderless, 0 = 100% male, 8 = 100% female
}

export interface PokemonStat {
  name: string;
  baseStat: number;
  iv: number;
  ev: number;
  total: number;
}

export interface Pokemon {
  id: number;
  name: string;
  nickname: string;
  frontImage: string;
  backImage: string;
  types: string[];
  stats: PokemonStat[];
  isShiny: boolean;
  gender: "male" | "female" | "genderless";
}

export interface TeamPokemon {
  pokemon: Pokemon;
  timestamp: number;
}
