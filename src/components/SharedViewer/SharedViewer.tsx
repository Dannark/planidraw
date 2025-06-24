import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ModelService, SceneConfig } from '../../services/modelService';
import ImportScene from '../../scenes/ImportScene';
import { Object3DItem } from '../ObjectListPanel/ObjectListPanel';
import './SharedViewer.css';

const SharedViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [sceneConfig, setSceneConfig] = useState<SceneConfig | null>(null);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [objectList, setObjectList] = useState<Object3DItem[]>([]);

  useEffect(() => {
    const loadModel = async () => {
      if (!id) {
        setError('ID do modelo não fornecido');
        setIsLoading(false);
        return;
      }

      try {
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
        setGlbUrl(config.glbUrl);
        setIsLoading(false);
      } catch (err) {
        console.error('Erro ao carregar modelo:', err);
        setError('Erro ao carregar o modelo');
        setIsLoading(false);
      }
    };

    loadModel();
  }, [id]);

  const handleObjectsUpdate = (objects: Object3DItem[]) => {
    setObjectList(objects);
  };

  const handleObjectClick = (object: Object3DItem) => {
    // Implementar lógica de seleção se necessário
    console.log('Objeto clicado:', object);
  };

  if (isLoading) {
    return (
      <div className="shared-viewer-loading">
        <div className="loading-spinner"></div>
        <p>Carregando modelo 3D...</p>
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

  if (!sceneConfig || !glbUrl) {
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
        <div className="viewer-actions">
          <button 
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="share-button"
          >
            Compartilhar Link
          </button>
        </div>
      </div>
      
      <div className="viewer-content">
        <ImportScene
          gltfUrl={glbUrl}
          onObjectsUpdate={handleObjectsUpdate}
          onObjectClick={handleObjectClick}
        />
      </div>
    </div>
  );
};

export default SharedViewer; 