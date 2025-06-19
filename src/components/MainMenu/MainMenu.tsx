import React, { useRef } from 'react';
import './MainMenu.css';

type MainMenuProps = {
  onImport: (file: File) => void;
  onToggleScene?: () => void;
  isImportScene?: boolean;
};

const MainMenu: React.FC<MainMenuProps> = ({ 
  onImport, 
  onToggleScene,
  isImportScene = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <div className="main-menu">
      <div className="menu-item">
        <button className="menu-button">Arquivo</button>
        <div className="dropdown-content">
          <div className="dropdown-item" onClick={handleImportClick}>
            Importar Modelo 3D
          </div>
          {onToggleScene && (
            <div className="dropdown-item" onClick={onToggleScene}>
              {isImportScene ? 'Ir para MainScene' : 'Ir para ImportScene'}
            </div>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf"
        onChange={handleFileChange}
        className="import-input"
      />
    </div>
  );
};

export default MainMenu; 