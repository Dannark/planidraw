import React, { useRef, useState } from 'react';
import SaveSceneModal from '../SaveSceneModal/SaveSceneModal';
import './MainMenu.css';

type MainMenuProps = {
  onImport: (file: File) => void;
  onToggleScene?: () => void;
  isImportScene?: boolean;
  currentFile?: File | null;
  cameraPosition?: { x: number; y: number; z: number };
  cameraTarget?: { x: number; y: number; z: number };
};

const MainMenu: React.FC<MainMenuProps> = ({ 
  onImport, 
  onToggleScene,
  isImportScene = true,
  currentFile,
  cameraPosition,
  cameraTarget
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  const handleSaveScene = () => {
    setIsSaveModalOpen(true);
  };

  return (
    <>
      <div className="main-menu">
        <div className="menu-item">
          <button className="menu-button">Arquivo</button>
          <div className="dropdown-content">
            <div className="dropdown-item" onClick={handleImportClick}>
              Importar Modelo 3D
            </div>
            {currentFile && (
              <div className="dropdown-item" onClick={handleSaveScene}>
                Salvar Cena
              </div>
            )}
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

      <SaveSceneModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentFile={currentFile || null}
        cameraPosition={cameraPosition}
        cameraTarget={cameraTarget}
      />
    </>
  );
};

export default MainMenu; 