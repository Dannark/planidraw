import React, { useState } from 'react';
import './ObjectListPanel.css';

export type Object3DItem = {
  uuid: string;
  type: string;
  visible: boolean;
  children?: any[];
};

type ObjectListPanelProps = {
  objects: Object3DItem[];
  onToggleVisibility: (uuid: string, visible: boolean) => void;
};

const ObjectListPanel: React.FC<ObjectListPanelProps> = ({ objects, onToggleVisibility }) => {
  const [expanded, setExpanded] = useState(true);

  const renderObjectCount = (obj: Object3DItem) => {
    if (!obj.children || obj.children.length === 0) return '';
    return ` (${obj.children.length})`;
  };

  return (
    <div className={`object-list-panel${expanded ? ' expanded' : ''}`}>  
      <button className="object-list-toggle" onClick={() => setExpanded((v) => !v)}>
        {expanded ? '↑ Ocultar Objetos' : '↓ Mostrar Objetos'}
      </button>
      {expanded && (
        <ul className="object-list">
          {objects.map((obj) => (
            <li key={obj.uuid} className="object-list-item">
              <label>
                <input
                  type="checkbox"
                  checked={obj.visible}
                  onChange={() => onToggleVisibility(obj.uuid, !obj.visible)}
                />
                <span className="object-type">{obj.type}{renderObjectCount(obj)}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ObjectListPanel; 