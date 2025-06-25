import React from 'react';
import './ObjectInfo.css';

interface ObjectInfoProps {
  vertexCount: number | null;
}

const ObjectInfo: React.FC<ObjectInfoProps> = ({ vertexCount }) => {
  if (vertexCount === null) return null;

  // Função para formatar o número com pontos
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="object-info">
      <div className="info-item">
        <span className="info-label">Total de Vértices:</span>
        <span className="info-value">{formatNumber(vertexCount)}</span>
      </div>
    </div>
  );
};

export default ObjectInfo;
