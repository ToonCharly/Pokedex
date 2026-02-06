import { exportTeamToJSON, importTeamFromJSON, loadTeamData, saveTeamData } from "../../../shared/utils";
import type { TeamPokemon, Pokemon } from "../../../shared/models";
import "../styles/pokedex-menu.css";

interface PokedexMenuProps {
  team: TeamPokemon[];
  onTeamImported: (team: TeamPokemon[]) => void;
  onClose: () => void;
  onViewPokemon: (pokemon: Pokemon) => void;
  onRemoveFromTeam: (timestamp: number) => void;
  onMultiplayer: () => void;
}

export function PokedexMenu({ 
  team, 
  onTeamImported, 
  onClose, 
  onViewPokemon,
  onRemoveFromTeam,
  onMultiplayer
}: PokedexMenuProps) {
  
  const handleExport = () => {
    const data = loadTeamData();
    exportTeamToJSON(data);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const data = await importTeamFromJSON(file);
          saveTeamData(data);
          onTeamImported(data.team);
          alert("✅ Equipo importado exitosamente");
        } catch (error) {
          alert("❌ Error al importar: " + (error as Error).message);
        }
      }
    };
    input.click();
  };

  return (
    <div className="pokedex-menu">
      <h2 className="menu-title">
        MENU
        <button className="close-menu-btn" onClick={onClose}>×</button>
      </h2>
        
        <div className="menu-section">
          <h3>EQUIPO {team.length}/6</h3>
          <div className="team-list">
            {team.length === 0 ? (
              <p className="empty-message">VACIO</p>
            ) : (
              team.map((member) => (
                <div key={member.timestamp} className="team-member">
                  <img 
                    src={member.pokemon.frontImage} 
                    alt={member.pokemon.name}
                    className={member.pokemon.isShiny ? "shiny-pokemon" : ""}
                  />
                  <div className="member-info">
                    <span className="member-nickname">{member.pokemon.nickname}</span>
                    <span className="member-name">
                      {member.pokemon.name}
                      {member.pokemon.isShiny && " ✨"}
                    </span>
                  </div>
                  <div className="member-actions">
                    <button 
                      onClick={() => {
                        onViewPokemon(member.pokemon);
                        onClose();
                      }}
                      className="btn-view"
                      title="Ver"
                    >
                      👁
                    </button>
                    <button 
                      onClick={() => onRemoveFromTeam(member.timestamp)}
                      className="btn-remove"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="menu-section">
          <h3>DATOS</h3>
          <div className="menu-buttons">
            <button onClick={handleExport} className="menu-btn save-btn">
              GUARDAR
            </button>
            <button onClick={handleImport} className="menu-btn import-btn">
              CARGAR
            </button>
          </div>
        </div>

        <div className="menu-section">
          <h3>JUEGO</h3>
          <div className="menu-buttons">
            <button 
              onClick={() => {
                onMultiplayer();
                onClose();
              }} 
              className="menu-btn multiplayer-btn"
            >
              BATALLA
            </button>
          </div>
        </div>
    </div>
  );
}
