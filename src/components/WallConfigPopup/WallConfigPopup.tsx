import React, { useState } from 'react';
import './WallConfigPopup.css';

interface WallConfigPopupProps {
  isVisible: boolean;
  onConfirm: (length: number, thickness: number, direction: 'front' | 'back' | 'right' | 'left') => void;
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
  const [direction, setDirection] = useState<'front' | 'back' | 'right' | 'left'>('front');

  if (!isVisible) return null;

  const handleConfirm = () => {
    onConfirm(length, thickness, direction);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="wall-config-popup-overlay">
      <div className="wall-config-popup">
        <h3>Configurar Nova Parede</h3>
        
        <div className="direction-picker">
          <button className={direction === 'front' ? 'selected' : ''} onClick={() => setDirection('front')}>↑</button>
          <div>
            <button className={direction === 'left' ? 'selected' : ''} onClick={() => setDirection('left')}>←</button>
            <button className={direction === 'right' ? 'selected' : ''} onClick={() => setDirection('right')}>→</button>
          </div>
          <button className={direction === 'back' ? 'selected' : ''} onClick={() => setDirection('back')}>↓</button>
        </div>

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
