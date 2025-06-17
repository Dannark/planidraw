import React from 'react';
import './InterfaceControls.css';

interface InterfaceControlsProps {
  is3D: boolean;
  onToggle3D: () => void;
  onAddWall: () => void;
}

const InterfaceControls: React.FC<InterfaceControlsProps> = ({
  is3D,
  onToggle3D,
  onAddWall,
}) => {
  return (
    <div className="interface-controls">
      <button
        className="toggle-button"
        onClick={onToggle3D}
      >
        {is3D ? 'Modo 2D' : 'Modo 3D'}
      </button>
      
      <button
        className="add-wall-button"
        onClick={onAddWall}
      >
        Adicionar Parede
      </button>
    </div>
  );
};

export default InterfaceControls;
