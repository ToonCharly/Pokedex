// types/pokemon.ts

export interface PokemonApiResponse {
  id: number;
  name: string;
  height: number; // en decímetros
  weight: number; // en hectogramos
  sprites: {
    front_default: string;
    back_default: string;
    front_shiny: string;
    back_shiny: string;
    front_female: string | null;
    back_female: string | null;
    front_shiny_female: string | null;
    back_shiny_female: string | null;
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
  height: number; // en centímetros
  weight: number; // en kilogramos
}

export interface TeamPokemon {
  pokemon: Pokemon;
  timestamp: number;
}
