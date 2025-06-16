import React from 'react';
import { Canvas } from '@react-three/fiber';
import MainScene from './scenes/MainScene';
import { ConfigProvider, useConfig } from './config/ConfigContext';
import './App.css';

function AppContent() {
  const { is3D, setIs3D } = useConfig();

  return (
    <div className="App">
      <div className="canvas-container">
        <Canvas camera={is3D ? { position: [0, 5, 10], fov: 75 } : undefined}>
          <MainScene />
        </Canvas>
      </div>
      <button
        className="toggle-button"
        onClick={() => setIs3D(!is3D)}
      >
        {is3D ? 'Modo 2D' : 'Modo 3D'}
      </button>
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
