import { usePokemon } from "../hooks/usePokemon";
import "../styles/pokedex.css";
import { useState } from "react";
import { PokedexMenu } from "./PokedexMenu";
import { TrainerNameModal } from "../../battle/components/TrainerNameModal";
import { BattleArena } from "../../battle/components/BattleArena";

export default function Pokedex() {
  const {
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
    team,
    addToTeam,
    removeFromTeam,
    viewTeamPokemon,
    setTeam,
  } = usePokemon();

  const [statsView, setStatsView] = useState<"attack" | "defense" | "pokemon">("pokemon");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameStep, setNicknameStep] = useState<"confirm" | "input">("confirm");
  const [nicknameInput, setNicknameInput] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showBattleModeModal, setShowBattleModeModal] = useState(false);
  const [battleMode, setBattleMode] = useState<number>(1);
  const [showPokemonSelector, setShowPokemonSelector] = useState(false);
  const [selectedBattleTeam, setSelectedBattleTeam] = useState<number[]>([]);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [inBattle, setInBattle] = useState(false);
  const [trainerName, setTrainerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);

  const handleMultiplayer = () => {
    if (team.length === 0) {
      alert("Necesitas al menos 1 Pokémon en tu equipo para batallar");
      return;
    }
    setShowBattleModeModal(true);
  };

  const handleBattleModeSelect = (mode: number) => {
    if (mode === 0) {
      // Modo libre - usar todos los Pokémon disponibles
      setBattleMode(0);
      setShowBattleModeModal(false);
      setShowTrainerModal(true);
      return;
    }
    
    if (team.length < mode) {
      alert(`Te faltan ${mode - team.length} Pokémon para jugar este modo de batalla`);
      return;
    }
    
    setBattleMode(mode);
    setShowBattleModeModal(false);
    
    if (team.length > mode) {
      // Tiene más Pokémon, necesita seleccionar
      setSelectedBattleTeam([]);
      setShowPokemonSelector(true);
    } else {
      // Tiene exactamente los necesarios
      setShowTrainerModal(true);
    }
  };

  const handlePokemonSelection = (index: number) => {
    setSelectedBattleTeam(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else if (prev.length < battleMode) {
        return [...prev, index];
      }
      return prev;
    });
  };

  const handleConfirmTeamSelection = () => {
    if (selectedBattleTeam.length !== battleMode) {
      alert(`Debes seleccionar exactamente ${battleMode} Pokémon`);
      return;
    }
    setShowPokemonSelector(false);
    setShowTrainerModal(true);
  };

  const handleTrainerConfirm = (name: string, pNumber: 1 | 2) => {
    setTrainerName(name);
    setPlayerNumber(pNumber);
    setShowTrainerModal(false);
    setInBattle(true);
  };

  const handleExitBattle = () => {
    setInBattle(false);
    setTrainerName("");
  };

  if (inBattle) {
    const battleTeam = battleMode === 0
      ? team.map(t => t.pokemon) // Modo libre: todos los Pokémon
      : selectedBattleTeam.length > 0
        ? selectedBattleTeam.map(index => team[index].pokemon)
        : team.slice(0, battleMode).map(t => t.pokemon);
    
    return (
      <BattleArena
        trainerName={trainerName}
        playerNumber={playerNumber}
        team={battleTeam}
        battleMode={battleMode}
        onExit={handleExitBattle}
      />
    );
  }

  if (!pokemon) return null;

  const handleAddToTeam = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmAdd = () => {
    setShowConfirmModal(false);
    setNicknameInput(pokemon.name);
    setNicknameStep("confirm");
    setShowNicknameModal(true);
  };

  const handleConfirmNickname = (wantsNickname: boolean) => {
    if (wantsNickname) {
      setNicknameStep("input");
    } else {
      addToTeam();
      setShowNicknameModal(false);
    }
  };

  const handleSubmitNickname = () => {
    const nickname = nicknameInput.trim() || pokemon.name;
    addToTeam(nickname);
    setShowNicknameModal(false);
  };

  const getGenderSymbol = (gender: string) => {
    if (gender === "male") return "♂";
    if (gender === "female") return "♀";
    return "⚲";
  };

  const getFilteredStats = () => {
    if (statsView === "attack") {
      return pokemon.stats.filter(stat => 
        stat.name === "attack" || 
        stat.name === "special-attack" || 
        stat.name === "speed"
      );
    } else {
      return pokemon.stats.filter(stat => 
        stat.name === "hp" || 
        stat.name === "defense" || 
        stat.name === "special-defense"
      );
    }
  };

  return (
    <div className="pokedex-wrapper">
      <div className="pokedex-book">
        {/* LEFT PANEL */}
        <div className="pokedex-left">
          {/* Top decorations */}
          <div 
            className="top-circle-blue" 
            onClick={() => setShowMenu(!showMenu)}
            style={{ cursor: 'pointer' }}
          ></div>
          <div className="top-lights">
            <div className="light-dot red"></div>
            <div className="light-dot yellow"></div>
            <div className="light-dot green"></div>
          </div>

          {/* Main screen frame */}
          <div className="screen-frame-white">
            <div className="screen-red-lights">
              <div className="red-dot"></div>
              <div className="red-dot"></div>
            </div>
            <div
              className={`pokemon-screen ${isTransitioning ? "opacity-0" : "opacity-100"}`}
              onClick={isFront ? showBack : showFront}
            >
              {statsView === "pokemon" ? (
                <>
                  <img
                    src={isFront ? pokemon.frontImage : pokemon.backImage}
                    alt={pokemon.name}
                    className={pokemon.isShiny ? "shiny-sparkle" : ""}
                  />
                  {pokemon.isShiny && <div className="shiny-badge">★</div>}
                </>
              ) : (
                <div className="stats-display">
                  <h3 className="stats-title">
                    {statsView === "attack" ? "STATS - ATTACK" : "STATS - DEFENSE"}
                  </h3>
                  {getFilteredStats().map((stat) => (
                    <div key={stat.name} className="stat-line">
                      <span className="stat-name-full">
                        {stat.name.toUpperCase().replace("-", " ")}
                      </span>
                      <div className="stat-values-display">
                        <span className="val base">B: {stat.baseStat}</span>
                        <span className="val iv">IV: {stat.iv}</span>
                        <span className="val ev">EV: {stat.ev}</span>
                        <span className="val total">T: {stat.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="screen-bottom-row">
              <div className="red-circle-big"></div>
              <div className="speaker-lines">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
              </div>
            </div>
          </div>

          {/* Search bar below screen */}
          <div className="search-bar-left">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchPokemon()}
              placeholder="Buscar Pokémon..."
            />
            <button onClick={searchPokemon}>🔍</button>
          </div>

          {/* Control buttons row with D-pad */}
          <div className="controls-row">
            <div 
              className="big-circle-gray"
              onClick={() => setStatsView("pokemon")}
            ></div>
            <div className="pill-btns">
              <div 
                className={`pill-btn red ${statsView === "attack" ? "active" : ""}`}
                onClick={() => setStatsView("attack")}
              ></div>
              <div 
                className={`pill-btn blue ${statsView === "defense" ? "active" : ""}`}
                onClick={() => setStatsView("defense")}
              ></div>
            </div>
            <div className="dpad-wrapper">
              <button className="dpad-btn dpad-up" onClick={showFront}></button>
              <button className="dpad-btn dpad-left" onClick={prevPokemon}></button>
              <button className="dpad-btn dpad-right" onClick={nextPokemon}></button>
              <button className="dpad-btn dpad-down" onClick={showBack}></button>
              <div className="dpad-center"></div>
            </div>
          </div>

          {/* Green rectangle below pills */}
          <div className="green-rectangle">
            <div className="size-weight-display">
              <div className="size-info">
                <span className="label">ALTURA:</span>
                <span className="value">{pokemon.height} cm</span>
              </div>
              <div className="weight-info">
                <span className="label">PESO:</span>
                <span className="value">{pokemon.weight.toFixed(1)} kg</span>
              </div>
            </div>
          </div>

          {/* Bottom indicators - debe estar fuera del bottom-area */}
          <div className="bottom-indicators">
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="pokedex-right">
          {/* Hinge curve */}
          <div className="hinge-curve"></div>

          {/* Top info panel - Pokemon name and types */}
          <div className="top-info-panel">
            <div className="name-row">
              <span className="name-label">NAME:</span>
              <span className="pokemon-name">
                {pokemon.name}
                {pokemon.nickname !== pokemon.name && ` | ${pokemon.nickname}`}
              </span>
              <span className={`gender-symbol ${pokemon.gender}`}>
                {getGenderSymbol(pokemon.gender)}
              </span>
            </div>
            <div className="types-row">
              <span className="type-label">TYPE:</span>
              {pokemon.types.map((type, index) => (
                <span key={type}>
                  {type}
                  {index < pokemon.types.length - 1 && " / "}
                </span>
              ))}
            </div>
          </div>

          {/* Team grid - 2 rows x 3 columns (6 slots) */}
          <div className="team-grid-compact">
            {Array.from({ length: 6 }).map((_, index) => {
              const member = team[index];
              return (
                <div key={index} className={`compact-slot ${member ? "has-pokemon" : ""}`}>
                  {member ? (
                    <>
                      <button
                        onClick={() => removeFromTeam(member.timestamp)}
                        className="remove-x"
                      >
                        ×
                      </button>
                      <img 
                        src={member.pokemon.frontImage} 
                        alt={member.pokemon.name}
                        onClick={() => viewTeamPokemon(member.pokemon)}
                        style={{ cursor: 'pointer' }}
                      />
                      {member.pokemon.isShiny && <span className="shiny-star">★</span>}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Green pill buttons above bottom row */}
          <div className="green-pills-row">
            <div className="green-pill-btn"></div>
            <div className="green-pill-btn"></div>
          </div>

          {/* White rectangles and yellow circle row */}
          <div className="bottom-row-right">
            <div className="white-squares-right">
              <div className="white-square-right"></div>
              <div className="white-square-right"></div>
            </div>
            <div className="yellow-circle" onClick={randomPokemon}>?</div>
          </div>

          {/* Info buttons row */}
          <div className="info-buttons-row">
            <div className="info-box">N° {pokemon.id.toString().padStart(3, "0")}</div>
            <div className="info-box" onClick={handleAddToTeam}>+ Add</div>
          </div>
        </div>
      </div>

      {/* Confirm Add Modal - Pokemon style */}
      {showConfirmModal && (
        <div className="pokemon-modal-overlay">
          <div className="pokemon-modal">
            <div className="pokemon-modal-text">
              ¿Estás seguro que quieres agregar a {pokemon.name.toUpperCase()}?
            </div>
            <div className="pokemon-modal-buttons">
              <button onClick={handleConfirmAdd}>SÍ</button>
              <button onClick={() => setShowConfirmModal(false)}>NO</button>
            </div>
          </div>
        </div>
      )}

      {/* Nickname Modal - Pokemon style */}
      {showNicknameModal && (
        <div className="pokemon-modal-overlay">
          <div className="pokemon-modal">
            <div className="pokemon-modal-text">
              {nicknameStep === "confirm" ? (
                <>¿Quieres darle un mote a tu {pokemon.name.toUpperCase()}?</>
              ) : (
                <>Escribe el mote para {pokemon.name.toUpperCase()}:</>
              )}
            </div>
            {nicknameStep === "input" && (
              <input
                type="text"
                className="pokemon-modal-input"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitNickname()}
                autoFocus
              />
            )}
            <div className="pokemon-modal-buttons">
              {nicknameStep === "confirm" ? (
                <>
                  <button onClick={() => handleConfirmNickname(true)}>SÍ</button>
                  <button onClick={() => handleConfirmNickname(false)}>NO</button>
                </>
              ) : (
                <>
                  <button onClick={handleSubmitNickname}>ACEPTAR</button>
                  <button onClick={() => setShowNicknameModal(false)}>CANCELAR</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showTrainerModal && (
        <TrainerNameModal
          onConfirm={handleTrainerConfirm}
          onCancel={() => setShowTrainerModal(false)}
        />
      )}

      {/* Battle Mode Selection Modal */}
      {showBattleModeModal && (
        <div className="pokemon-modal-overlay">
          <div className="pokemon-modal" style={{ maxWidth: '500px' }}>
            <div className="pokemon-modal-text" style={{ fontSize: '12px', marginBottom: '15px' }}>
              SELECCIONA EL MODO DE BATALLA
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
              {[1, 2, 3, 4, 5, 6].map(mode => (
                <button
                  key={mode}
                  onClick={() => handleBattleModeSelect(mode)}
                  className="pokemon-modal-buttons"
                  style={{
                    padding: '15px 10px',
                    fontSize: '14px',
                    background: team.length >= mode ? '#f8f8f8' : '#d0d0d0',
                    cursor: team.length >= mode ? 'pointer' : 'not-allowed',
                    border: '4px solid #303030',
                    boxShadow: 'inset -2px -2px 0 #a8a8a8, inset 2px 2px 0 #ffffff, 4px 4px 0 rgba(0,0,0,0.2)'
                  }}
                  disabled={team.length < mode}
                >
                  {mode} vs {mode}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleBattleModeSelect(0)}
              className="pokemon-modal-buttons"
              style={{ 
                width: '100%', 
                padding: '12px',
                marginBottom: '10px',
                background: '#10b981',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              MODO LIBRE (Todos tus Pokémon)
            </button>
            <button
              onClick={() => setShowBattleModeModal(false)}
              className="pokemon-modal-buttons"
              style={{ width: '100%', padding: '10px' }}
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {/* Pokemon Selector Modal */}
      {showPokemonSelector && (
        <div className="pokemon-modal-overlay">
          <div className="pokemon-modal" style={{ maxWidth: '600px' }}>
            <div className="pokemon-modal-text" style={{ fontSize: '11px', marginBottom: '15px' }}>
              ELIGE {battleMode} POKÉMON PARA LA BATALLA ({selectedBattleTeam.length}/{battleMode})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '15px' }}>
              {team.map((member, index) => (
                <div
                  key={member.timestamp}
                  onClick={() => handlePokemonSelection(index)}
                  style={{
                    padding: '10px',
                    background: selectedBattleTeam.includes(index) ? '#10b981' : '#f8f8f8',
                    border: '4px solid #303030',
                    borderRadius: '0',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: selectedBattleTeam.includes(index) 
                      ? 'inset 2px 2px 0 #059669, inset -2px -2px 0 #34d399'
                      : 'inset -2px -2px 0 #a8a8a8, inset 2px 2px 0 #ffffff'
                  }}
                >
                  <img 
                    src={member.pokemon.frontImage} 
                    alt={member.pokemon.name}
                    style={{ width: '48px', height: '48px', imageRendering: 'pixelated' }}
                  />
                  <span style={{ 
                    fontSize: '8px', 
                    color: selectedBattleTeam.includes(index) ? '#fff' : '#303030',
                    fontFamily: 'Press Start 2P',
                    textTransform: 'uppercase',
                    textAlign: 'center'
                  }}>
                    {member.pokemon.nickname}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleConfirmTeamSelection}
                className="pokemon-modal-buttons"
                style={{ 
                  flex: 1, 
                  padding: '10px',
                  background: selectedBattleTeam.length === battleMode ? '#10b981' : '#d0d0d0',
                  color: selectedBattleTeam.length === battleMode ? '#fff' : '#303030'
                }}
                disabled={selectedBattleTeam.length !== battleMode}
              >
                CONFIRMAR
              </button>
              <button
                onClick={() => {
                  setShowPokemonSelector(false);
                  setSelectedBattleTeam([]);
                }}
                className="pokemon-modal-buttons"
                style={{ flex: 1, padding: '10px' }}
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu como ventana modal independiente */}
      {showMenu && (
        <div className="menu-modal-overlay" onClick={() => setShowMenu(false)}>
          <div className="menu-modal-window" onClick={(e) => e.stopPropagation()}>
            <PokedexMenu
              team={team}
              onTeamImported={setTeam}
              onClose={() => setShowMenu(false)}
              onViewPokemon={viewTeamPokemon}
              onRemoveFromTeam={removeFromTeam}
              onMultiplayer={handleMultiplayer}
            />
          </div>
        </div>
      )}
    </div>
  );
}
