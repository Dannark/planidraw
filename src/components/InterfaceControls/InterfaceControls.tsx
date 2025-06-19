import React from 'react';
import './InterfaceControls.css';

type InterfaceControlsProps = {
  is3D: boolean;
  onToggle3D: () => void;
};

const Mode2DIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3h18v18H3V3zm16 16V5H5v14h14z" fill="currentColor"/>
    <path d="M15 7H9v10h6V7zm-2 8h-2V9h2v6z" fill="currentColor"/>
  </svg>
);

const Mode3DIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 7l9 5 9-5-9-5z" fill="currentColor"/>
    <path d="M3 12l9 5 9-5M3 17l9 5 9-5" fill="currentColor" opacity="0.5"/>
  </svg>
);

const InterfaceControls: React.FC<InterfaceControlsProps> = ({ is3D, onToggle3D }) => {
  return (
    <button 
      className="mode-toggle-button" 
      onClick={onToggle3D}
      title={is3D ? "Mudar para Modo 2D" : "Mudar para Modo 3D"}
    >
      {is3D ? <Mode2DIcon /> : <Mode3DIcon />}
      <span className="mode-label">{is3D ? '2D' : '3D'}</span>
    </button>
  );
};

export default InterfaceControls;
