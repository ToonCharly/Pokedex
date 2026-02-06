import { useState } from "react";
import "../styles/trainer-modal.css";

interface TrainerNameModalProps {
  onConfirm: (trainerName: string, playerNumber: 1 | 2) => void;
  onCancel: () => void;
}

export function TrainerNameModal({ onConfirm, onCancel }: TrainerNameModalProps) {
  const [trainerName, setTrainerName] = useState("");
  const [playerNumber, setPlayerNumber] = useState<1 | 2>(1);

  const handleSubmit = () => {
    if (trainerName.trim()) {
      onConfirm(trainerName.trim(), playerNumber);
    }
  };

  return (
    <div className="trainer-modal-overlay">
      <div className="trainer-modal">
        <h2 className="modal-title">BATALLA POKEMON</h2>
        
        <div className="modal-content">
          <label className="modal-label">
            NOMBRE ENTRENADOR:
            <input
              type="text"
              value={trainerName}
              onChange={(e) => setTrainerName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="ASH"
              maxLength={12}
              className="modal-input"
              autoFocus
            />
          </label>

          <label className="modal-label">
            JUGADOR:
            <div className="player-selector">
              <button
                className={`player-btn ${playerNumber === 1 ? "active" : ""}`}
                onClick={() => setPlayerNumber(1)}
              >
                JUGADOR 1
              </button>
              <button
                className={`player-btn ${playerNumber === 2 ? "active" : ""}`}
                onClick={() => setPlayerNumber(2)}
              >
                JUGADOR 2
              </button>
            </div>
          </label>
        </div>

        <div className="modal-buttons">
          <button onClick={handleSubmit} className="modal-btn confirm-btn">
            ACEPTAR
          </button>
          <button onClick={onCancel} className="modal-btn cancel-btn">
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
}
