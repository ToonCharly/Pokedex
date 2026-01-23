import { useEffect, useState } from "react";
import type { Pokemon, PokemonApiResponse, PokemonSpeciesResponse, TeamPokemon, PokemonMove } from "../types/pokemon";
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

// Obtiene los movimientos de un Pokémon (máximo 4)
const loadPokemonMoves = async (pokemonId: number): Promise<PokemonMove[]> => {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    const data: PokemonApiResponse = await response.json();

    // Obtener hasta 4 movimientos
    const moves: PokemonMove[] = [];
    for (let i = 0; i < Math.min(4, data.moves?.length || 0); i++) {
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
};

// Movimientos por defecto si hay error
const getDefaultMoves = (): PokemonMove[] => [
  { name: "Placaje", power: 40, accuracy: 100, type: "normal" },
  { name: "Rayo", power: 90, accuracy: 100, type: "electric" },
  { name: "Ascuas", power: 40, accuracy: 100, type: "fire" },
  { name: "Pistola Agua", power: 40, accuracy: 100, type: "water" },
];

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
        setIsTransitioning(true);
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const data: PokemonApiResponse = await response.json();

        // Fetch species data for gender rate
        const speciesResponse = await fetch(data.species.url);
        const speciesData: PokemonSpeciesResponse = await speciesResponse.json();

        if (isCancelled) return;

        const isShiny = isShinyPokemon();
        const gender = determineGender(speciesData.gender_rate);

        // Seleccionar sprites correctos según género y shiny
        let frontImage: string;
        let backImage: string;

        if (gender === "female" && data.sprites.front_female) {
          frontImage = isShiny && data.sprites.front_shiny_female 
            ? data.sprites.front_shiny_female 
            : data.sprites.front_female;
          backImage = isShiny && data.sprites.back_shiny_female 
            ? data.sprites.back_shiny_female 
            : data.sprites.back_female || data.sprites.back_default;
        } else {
          frontImage = isShiny ? data.sprites.front_shiny : data.sprites.front_default;
          backImage = isShiny ? data.sprites.back_shiny : data.sprites.back_default;
        }

        // Cargar movimientos
        const moves = await loadPokemonMoves(pokemonId);

        if (isCancelled) return;

        setPokemon({
          id: data.id,
          name: data.name,
          nickname: data.name,
          frontImage,
          backImage,
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
          height: data.height * 10,
          weight: data.weight / 10,
          moves,
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
    const query = searchInput.toLowerCase().trim();
    const numericId = parseInt(query);
    
    if (!isNaN(numericId) && numericId > 0) {
      // Solo activar transición si es un ID diferente
      if (numericId !== pokemonId) {
        setIsTransitioning(true);
        setPokemonId(numericId);
      }
      setSearchInput(""); // Limpiar input después de buscar
    } else {
      // Buscar por nombre
      fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
        .then(res => {
          if (!res.ok) throw new Error("No encontrado");
          return res.json();
        })
        .then((data: PokemonApiResponse) => {
          // Solo activar transición si es un ID diferente
          if (data.id !== pokemonId) {
            setIsTransitioning(true);
            setPokemonId(data.id);
          }
          setSearchInput(""); // Limpiar input después de buscar
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
