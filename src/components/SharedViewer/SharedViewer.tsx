import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ModelService, SceneConfig } from '../../services/modelService';
import { Canvas, useThree } from '@react-three/fiber';
import ImportScene from '../../scenes/ImportScene';
import { Object3DItem } from '../ObjectListPanel/ObjectListPanel';
import InterfaceControls from '../InterfaceControls/InterfaceControls';
import { useConfig } from '../../config/ConfigContext';
import './SharedViewer.css';

// Componente para ajustar a câmera após o carregamento
const CameraSetup: React.FC<{ sceneConfig: SceneConfig }> = ({ sceneConfig }) => {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if (sceneConfig.cameraPosition) {
      camera.position.set(
        sceneConfig.cameraPosition.x,
        sceneConfig.cameraPosition.y,
        sceneConfig.cameraPosition.z
      );
      // console.log('🎯 [CameraSetup] camera.position:', camera.position, sceneConfig);
    }
    
    if (controls && sceneConfig.cameraTarget) {
      // @ts-ignore - o tipo controls pode não estar definido corretamente
      controls.target.set(
        sceneConfig.cameraTarget.x,
        sceneConfig.cameraTarget.y,
        sceneConfig.cameraTarget.z
      );
      // @ts-ignore
      controls.update();
    }
  }, [camera, controls, sceneConfig]);

  return null;
};

const SharedViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sceneConfig, setSceneConfig] = useState<SceneConfig | null>(null);
  const [localGlbUrl, setLocalGlbUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objectList, setObjectList] = useState<Object3DItem[]>([]);
  const { is3D, setIs3D } = useConfig();
  const loadingRef = useRef(false); // Novo ref para controlar o carregamento

  useEffect(() => {
    const loadModel = async () => {
      // Se já estiver carregando, não faz nada
      if (loadingRef.current) return;
      
      console.log('🎯 [SharedViewer] loadModel', id);
      if (!id) {
        setError('ID do modelo não fornecido');
        setIsLoading(false);
        return;
      }

      try {
        loadingRef.current = true; // Marca como carregando
        setIsLoading(true);
        setError(null);

        // Buscar configuração da cena
        const config = await ModelService.getModelById(id);
        if (!config) {
          setError('Modelo não encontrado');
          setIsLoading(false);
          return;
        }

        setSceneConfig(config);

        // Fazer download do modelo
        const modelArrayBuffer = await ModelService.downloadModel(
          config.glbUrl,
          id,
          config
        );
        
        // Converter ArrayBuffer para Blob e criar URL local
        const blob = new Blob([modelArrayBuffer], { type: 'model/gltf-binary' });
        const localUrl = URL.createObjectURL(blob);
        setLocalGlbUrl(localUrl);
        setIsLoading(false);

      } catch (err) {
        console.error('Erro ao carregar modelo:', err);
        setError('Erro ao carregar o modelo');
        setIsLoading(false);
      } finally {
        // loadingRef.current = false; // Marca como não carregando mais
      }
    };

    loadModel();

    // Cleanup: liberar URLs locais ao desmontar
    return () => {
      if (localGlbUrl) {
        URL.revokeObjectURL(localGlbUrl);
      }
      // loadingRef.current = false; // Reseta o flag no cleanup
    };
  }, [id]);

  const handleObjectsUpdate = (objects: Object3DItem[]) => {
    setObjectList(objects);
  };

  const handleObjectClick = (object: Object3DItem) => {
    console.log('Objeto clicado:', object);
  };

  if (isLoading) {
    return (
      <div className="shared-viewer-loading">
        <div className="loading-spinner"></div>
        <p>Carregando projeto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-viewer-error">
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={() => window.history.back()}>Voltar</button>
      </div>
    );
  }

  if (!sceneConfig || !localGlbUrl) {
    return (
      <div className="shared-viewer-error">
        <h2>Modelo não encontrado</h2>
        <button onClick={() => window.history.back()}>Voltar</button>
      </div>
    );
  }

  return (
    <div className="shared-viewer">
      <div className="viewer-header">
        <h1>{sceneConfig.name}</h1>
        {sceneConfig.description && (
          <p className="model-description">{sceneConfig.description}</p>
        )}
      </div>
      
      <div className="viewer-content">
        <Canvas>
          <ImportScene
            gltfUrl={localGlbUrl}
            onObjectsUpdate={handleObjectsUpdate}
            onObjectClick={handleObjectClick}
          />
          <CameraSetup sceneConfig={sceneConfig} />
        </Canvas>
      </div>
      <InterfaceControls
        is3D={is3D}
        onToggle3D={() => setIs3D(!is3D)}
      />
    </div>
  );
};

export default SharedViewer; 