import React, { useState } from 'react';

interface WallConfigPopupProps {
  isVisible: boolean;
  onConfirm: (length: number, thickness: number) => void;
  onCancel: () => void;
  defaultLength?: number;
  defaultThickness?: number;
}

const WallConfigPopup: React.FC<WallConfigPopupProps> = ({
  isVisible,
  onConfirm,
  onCancel,
  defaultLength = 6,
  defaultThickness = 0.15,
}) => {
  const [length, setLength] = useState(defaultLength);
  const [thickness, setThickness] = useState(defaultThickness);

  if (!isVisible) return null;

  const handleConfirm = () => {
    onConfirm(length, thickness);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="wall-config-popup-overlay">
      <div className="wall-config-popup">
        <h3>Configurar Nova Parede</h3>
        
        <div className="form-group">
          <label htmlFor="length">Comprimento (metros):</label>
          <input
            id="length"
            type="number"
            value={length}
            onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
            min="0.1"
            max="50"
            step="0.1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="thickness">Largura (metros):</label>
          <input
            id="thickness"
            type="number"
            value={thickness}
            onChange={(e) => setThickness(parseFloat(e.target.value) || 0)}
            min="0.05"
            max="2"
            step="0.01"
          />
        </div>

        <div className="popup-buttons">
          <button className="btn-cancel" onClick={handleCancel}>
            Cancelar
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WallConfigPopup; 