import { useEffect, useState } from "react";
import type { Pokemon, PokemonApiResponse, PokemonSpeciesResponse, TeamPokemon } from "../types/pokemon";
import { loadTeamData, saveTeamData } from "../utils/storage";

// Genera un IV aleatorio (0-31)
const generateIV = (isShiny: boolean) => {
  const baseIV = Math.floor(Math.random() * 32);
  return isShiny ? Math.min(31, baseIV + 10) : baseIV;
};

// Genera EVs aleatorios (0-252)
const generateEV = () => Math.floor(Math.random() * 253);

// Determina si es shiny (1/4096 chance)
const isShinyPokemon = () => Math.random() < 1 / 4096;

// Determina el género basado en gender_rate
const determineGender = (genderRate: number): "male" | "female" | "genderless" => {
  if (genderRate === -1) return "genderless";
  const femaleChance = genderRate / 8;
  return Math.random() < femaleChance ? "female" : "male";
};

export function usePokemon() {
  const [pokemonId, setPokemonId] = useState(1);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isFront, setIsFront] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  
  // Cargar equipo desde localStorage al iniciar
  const [team, setTeam] = useState<TeamPokemon[]>(() => {
    const savedData = loadTeamData();
    return savedData.team;
  });

  // Guardar equipo automáticamente cada vez que cambie
  useEffect(() => {
    const savedData = loadTeamData();
    saveTeamData({
      ...savedData,
      team,
    });
  }, [team]);

  useEffect(() => {
    let isCancelled = false;
    
    const loadPokemon = async () => {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const data: PokemonApiResponse = await response.json();

        // Fetch species data for gender rate
        const speciesResponse = await fetch(data.species.url);
        const speciesData: PokemonSpeciesResponse = await speciesResponse.json();

        if (isCancelled) return;

        const isShiny = isShinyPokemon();
        const gender = determineGender(speciesData.gender_rate);

        setPokemon({
          id: data.id,
          name: data.name,
          nickname: data.name,
          frontImage: isShiny ? data.sprites.front_shiny : data.sprites.front_default,
          backImage: isShiny ? data.sprites.back_shiny : data.sprites.back_default,
          types: data.types.map(t => t.type.name),
          stats: data.stats.map(s => {
            const iv = generateIV(isShiny);
            const ev = generateEV();
            return {
              name: s.stat.name,
              baseStat: s.base_stat,
              iv,
              ev,
              total: s.base_stat + iv + Math.floor(ev / 4),
            };
          }),
          isShiny,
          gender,
        });
        setIsFront(true);
        setIsTransitioning(false);
      } catch (error) {
        if (!isCancelled) {
          console.error("Error fetching Pokemon:", error);
          setIsTransitioning(false);
        }
      }
    };

    loadPokemon();
    
    return () => {
      isCancelled = true;
    };
  }, [pokemonId]);

  const nextPokemon = () => {
    setIsTransitioning(true);
    setPokemonId(id => id + 1);
  };

  const prevPokemon = () => {
    setPokemonId(id => {
      if (id > 1) {
        setIsTransitioning(true);
        return id - 1;
      }
      return id;
    });
  };

  const randomPokemon = () => {
    setIsTransitioning(true);
    const randomId = Math.floor(Math.random() * 1010) + 1;
    setPokemonId(randomId);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowUp":
          setIsFront(true);
          break;
        case "ArrowDown":
          setIsFront(false);
          break;
        case "ArrowLeft":
          setPokemonId(id => {
            if (id > 1) {
              setIsTransitioning(true);
              return id - 1;
            }
            return id;
          });
          break;
        case "ArrowRight":
          setIsTransitioning(true);
          setPokemonId(id => id + 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const showFront = () => setIsFront(true);
  const showBack = () => setIsFront(false);

  const searchPokemon = () => {
    if (!searchInput.trim()) return;
    setIsTransitioning(true);
    const query = searchInput.toLowerCase().trim();
    const numericId = parseInt(query);
    
    if (!isNaN(numericId) && numericId > 0) {
      setPokemonId(numericId);
    } else {
      // Buscar por nombre
      fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
        .then(res => res.json())
        .then((data: PokemonApiResponse) => {
          setPokemonId(data.id);
        })
        .catch(() => {
          alert("Pokémon no encontrado");
          setIsTransitioning(false);
        });
    }
  };

  const updateNickname = (nickname: string) => {
    if (pokemon) {
      setPokemon({ ...pokemon, nickname });
    }
  };

  const addToTeam = (nickname?: string) => {
    if (!pokemon) return;
    if (team.length >= 6) {
      alert("El equipo ya tiene 6 Pokémon");
      return;
    }
    const pokemonToAdd = nickname ? { ...pokemon, nickname } : pokemon;
    setTeam([...team, { pokemon: pokemonToAdd, timestamp: Date.now() }]);
  };

  const removeFromTeam = (timestamp: number) => {
    setTeam(team.filter(t => t.timestamp !== timestamp));
  };

  const viewTeamPokemon = (teamPokemon: Pokemon) => {
    setPokemon(teamPokemon);
    setIsFront(true);
  };

  return {
    pokemon,
    isFront,
    isTransitioning,
    nextPokemon,
    prevPokemon,
    randomPokemon,
    showFront,
    showBack,
    searchInput,
    setSearchInput,
    searchPokemon,
    updateNickname,
    team,
    setTeam,
    addToTeam,
    removeFromTeam,
    viewTeamPokemon,
  };
}
