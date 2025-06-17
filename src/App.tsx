import React from 'react';
import { Canvas } from '@react-three/fiber';
import MainScene from './scenes/MainScene';
import WallConfigPopup from './components/WallConfigPopup/WallConfigPopup';
import InterfaceControls from './components/InterfaceControls/InterfaceControls';
import { ConfigProvider, useConfig } from './config/ConfigContext';
import './App.css';

function AppContent() {
  const { 
    is3D, 
    setIs3D, 
    showConfigPopup, 
    setShowConfigPopup, 
    pendingWallConfig, 
    setPendingWallConfig 
  } = useConfig();

  const handleAddWall = () => {
    // Armazena a configuração pendente e mostra o popup
    setPendingWallConfig({ wallIdx: 0, end: 'A', slot: 'forward' });
    setShowConfigPopup(true);
  };

  const handleConfirmAddWall = (length: number, thickness: number) => {
    // Armazena as configurações no contexto para o MainScene acessar
    if (pendingWallConfig) {
      // Dispara um evento customizado com as configurações
      const event = new CustomEvent('wallConfigConfirmed', {
        detail: { length, thickness, config: pendingWallConfig }
      });
      window.dispatchEvent(event);
    }
    
    // Fecha o popup
    setShowConfigPopup(false);
    setPendingWallConfig(null);
  };

  const handleCancelAddWall = () => {
    setShowConfigPopup(false);
    setPendingWallConfig(null);
  };

  return (
    <div className="App">
      <div className="canvas-container">
        <Canvas camera={is3D ? { position: [0, 5, 10], fov: 75 } : undefined}>
          <MainScene />
        </Canvas>
      </div>
      
      <InterfaceControls
        is3D={is3D}
        onToggle3D={() => setIs3D(!is3D)}
        onAddWall={handleAddWall}
      />
      
      {/* Popup de configuração da parede */}
      <WallConfigPopup
        isVisible={showConfigPopup}
        onConfirm={handleConfirmAddWall}
        onCancel={handleCancelAddWall}
        defaultLength={6}
        defaultThickness={0.15}
      />
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}
