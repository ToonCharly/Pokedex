// shared/models/storage.model.ts
import type { TeamPokemon } from "./pokemon.model";

export interface StorageData {
  team: TeamPokemon[];
  lastUpdated: string | null;
  settings: {
    maxTeamSize: number;
    autoSave: boolean;
  };
}
