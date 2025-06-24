import React, { useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import MainScene from './scenes/MainScene';
import ImportScene from './scenes/ImportScene';
import SharedViewer from './components/SharedViewer/SharedViewer';
import WallConfigPopup from './components/WallConfigPopup/WallConfigPopup';
import InterfaceControls from './components/InterfaceControls/InterfaceControls';
import { ConfigProvider, useConfig } from './config/ConfigContext';
import MainMenu from './components/MainMenu/MainMenu';
import ObjectListPanel, { Object3DItem } from './components/ObjectListPanel/ObjectListPanel';
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

  // Estado para alternar entre cenas
  const [showImportScene, setShowImportScene] = React.useState(true);
  const [importedFile, setImportedFile] = React.useState<File | null>(null);
  const [gltfUrl, setGltfUrl] = React.useState<string | null>(null);
  
  // Estado para a lista de objetos 3D
  const [objectList, setObjectList] = React.useState<Object3DItem[]>([]);
  const [selectedObjectUuid, setSelectedObjectUuid] = React.useState<string | null>(null);

  // Refs para capturar posição da câmera
  const cameraPositionRef = useRef<{ x: number; y: number; z: number } | undefined>(undefined);
  const cameraTargetRef = useRef<{ x: number; y: number; z: number } | undefined>(undefined);

  const handleConfirmAddWall = (length: number, thickness: number, direction: 'front' | 'back' | 'right' | 'left') => {
    // Armazena as configurações no contexto para o MainScene acessar
    if (pendingWallConfig) {
      console.log('pendingWallConfig', pendingWallConfig, 'direction', direction);
      // Dispara um evento customizado com as configurações
      const event = new CustomEvent('wallConfigConfirmed', {
        detail: { length, thickness, direction, config: pendingWallConfig }
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

  // Função para passar para ImportControls
  const handleImport = (file: File) => {
    // Libera a URL anterior, se houver
    if (gltfUrl) {
      URL.revokeObjectURL(gltfUrl);
    }
    const url = URL.createObjectURL(file);
    setImportedFile(file);
    setGltfUrl(url);
  };

  // Callback para atualizar a lista de objetos
  const handleObjectsUpdate = (objects: Object3DItem[]) => {
    setObjectList(objects);
  };

  // Callback para alternar visibilidade
  const handleToggleVisibility = (object: Object3DItem) => {
    // Dispara um evento customizado para o ImportScene
    const event = new CustomEvent('toggleVisibility', { detail: { object } });
    window.dispatchEvent(event);

    // Atualiza apenas o objeto específico no estado local
    const updateVisibility = (items: Object3DItem[], targetUuid: string, newVisible: boolean): Object3DItem[] => {
      return items.map(item => {
        if (item.uuid === targetUuid) {
          return { ...item, visible: newVisible };
        }
        if (item.children) {
          return {
            ...item,
            children: updateVisibility(item.children, targetUuid, newVisible)
          };
        }
        return item;
      });
    };

    setObjectList(prev => updateVisibility(prev, object.uuid, !object.visible));
  };

  // Callback para selecionar objeto
  const handleSelectObject = (object: Object3DItem) => {
    setSelectedObjectUuid(object.uuid);
  };

  const handleObjectClick = (object: Object3DItem) => {
    console.log('🎯 [App] Objeto clicado2:', object);
    setSelectedObjectUuid(object.uuid);
  };

  const onToggle3D = () => {
    setIs3D(!is3D);
  };

  // Função para atualizar posição da câmera
  const handleCameraUpdate = (position: { x: number; y: number; z: number }, target: { x: number; y: number; z: number }) => {
    cameraPositionRef.current = position;
    cameraTargetRef.current = target;
  };

  return (
    <Router>
      <Routes>
        {/* Rota para visualização compartilhável */}
        <Route path="/viewer/:id" element={<SharedViewer />} />
        
        {/* Rota principal */}
        <Route path="/" element={
          <div className="App">
            <div className="canvas-container">
              {showImportScene && (
                <MainMenu 
                  onImport={handleImport} 
                  onToggleScene={() => setShowImportScene((v) => !v)}
                  isImportScene={showImportScene}
                  currentFile={importedFile}
                  cameraPosition={cameraPositionRef.current}
                  cameraTarget={cameraTargetRef.current}
                />
              )}
              <Canvas
                camera={is3D ? { position: [0, 5, 10], fov: 75 } : undefined}>
                {showImportScene ? (
                  <ImportScene 
                    gltfUrl={gltfUrl} 
                    onObjectsUpdate={handleObjectsUpdate}
                    onObjectClick={handleObjectClick}
                    selectedObjectUuid={selectedObjectUuid || undefined}
                    onCameraUpdate={handleCameraUpdate}
                  />
                ) : (
                  <MainScene />
                )}
              </Canvas>
              {showImportScene && objectList.length > 0 && (
                <ObjectListPanel 
                  objects={objectList} 
                  onToggleVisibility={handleToggleVisibility}
                  onSelectObject={handleSelectObject}
                  selectedObjectUuid={selectedObjectUuid || undefined}
                />
              )}
            </div>
            <InterfaceControls
              is3D={is3D}
              onToggle3D={() => onToggle3D()}
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
        } />
        
        {/* Redirecionar qualquer rota não encontrada para a página principal */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}
