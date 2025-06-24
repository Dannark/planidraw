import React, { useState } from 'react';
import { ModelService } from '../../services/modelService';
import './SaveSceneModal.css';

interface SaveSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFile: File | null;
  cameraPosition?: { x: number; y: number; z: number };
  cameraTarget?: { x: number; y: number; z: number };
}

const SaveSceneModal: React.FC<SaveSceneModalProps> = ({
  isOpen,
  onClose,
  currentFile,
  cameraPosition,
  cameraTarget
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentFile) {
      setError('Nenhum arquivo carregado');
      return;
    }

    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const sceneConfig = await ModelService.uploadModel(
        currentFile,
        name.trim(),
        description.trim() || undefined,
        cameraPosition,
        cameraTarget
      );

      const shareUrl = `${window.location.origin}/viewer/${sceneConfig.id}`;
      setSuccess(`Cena salva com sucesso! Link compartilhável: ${shareUrl}`);
      
      // Limpar formulário
      setName('');
      setDescription('');
      
    } catch (err) {
      console.error('Erro ao salvar cena:', err);
      setError('Erro ao salvar a cena. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      setSuccess(null);
      setName('');
      setDescription('');
      onClose();
    }
  };

  const copyToClipboard = () => {
    if (success) {
      const url = success.split('Link compartilhável: ')[1];
      navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="save-scene-modal-overlay" onClick={handleClose}>
      <div className="save-scene-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Salvar Cena</h2>
          <button className="close-button" onClick={handleClose} disabled={isLoading}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Nome da Cena *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome da cena"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição (opcional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite uma descrição para a cena"
              disabled={isLoading}
              rows={3}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <p>{success.split('Link compartilhável: ')[0]}</p>
              <div className="share-link-container">
                <input
                  type="text"
                  value={success.split('Link compartilhável: ')[1]}
                  readOnly
                  className="share-link-input"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="copy-button"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="cancel-button"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="save-button"
            >
              {isLoading ? 'Salvando...' : 'Salvar Cena'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveSceneModal; 