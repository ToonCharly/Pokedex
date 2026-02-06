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
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  const [inBattle, setInBattle] = useState(false);
  const [trainerName, setTrainerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);

  const handleMultiplayer = () => {
    if (team.length === 0) {
      alert("Necesitas al menos 1 Pokémon en tu equipo para batallar");
      return;
    }
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
    return (
      <BattleArena
        trainerName={trainerName}
        playerNumber={playerNumber}
        team={team.map(t => t.pokemon)}
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
