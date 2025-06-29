import React, { useState, useEffect, useRef } from 'react';
import './ObjectListPanel.css';

export type Object3DItem = {
  uuid: string;
  type: string;
  visible: boolean;
  parent?: Object3DItem | null;
  children?: Object3DItem[];
};

type ObjectListPanelProps = {
  objects: Object3DItem[];
  onToggleVisibility: (object: Object3DItem) => void;
  onSelectObject: (object: Object3DItem) => void;
  selectedObjectUuid?: string;
};

type ObjectItemProps = {
  object: Object3DItem;
  level?: number;
  onToggleVisibility: (object: Object3DItem) => void;
  onSelectObject: (object: Object3DItem) => void;
  selectedObjectUuid?: string;
};

const ObjectItem: React.FC<ObjectItemProps> = ({ 
  object, 
  level = 0,
  onToggleVisibility,
  onSelectObject,
  selectedObjectUuid
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = object.children && object.children.length > 0;
  const isSelected = selectedObjectUuid === object.uuid;
  const itemRef = useRef<HTMLLIElement>(null);

  // Efeito para fazer scroll quando o item é selecionado
  useEffect(() => {
    if (isSelected && itemRef.current) {
      itemRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [isSelected]);

  const renderObjectCount = () => {
    if (!hasChildren) return '';
    return ` (${object.children!.length})`;
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectObject(object);
  };

  return (
    <li ref={itemRef} className="object-list-item" style={{ paddingLeft: `${16}px` }}>
      <div className="object-item-content">
        <input
          type="checkbox"
          checked={object.visible}
          onChange={(e) => {
            e.stopPropagation();
            onToggleVisibility(object);
          }}
          className="visibility-checkbox"
        />
        <button 
          className={`expand-button${hasChildren ? ' has-children' : ''}${isExpanded ? ' expanded' : ''}`}
          onClick={handleExpandClick}
          disabled={!hasChildren}
        >
          {hasChildren ? '▶' : ''}
        </button>
        <span 
          className={`object-type${isSelected ? ' selected' : ''}`}
          onClick={handleLabelClick}
          title="Clique para selecionar"
        >
          {object.type}{renderObjectCount()}
        </span>
      </div>
      {isExpanded && hasChildren && (
        <ul className="object-children">
          {object.children!.map((child) => (
            <ObjectItem
              key={child.uuid}
              object={child}
              level={level + 1}
              onToggleVisibility={onToggleVisibility}
              onSelectObject={onSelectObject}
              selectedObjectUuid={selectedObjectUuid}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const ObjectListPanel: React.FC<ObjectListPanelProps> = ({ 
  objects, 
  onToggleVisibility,
  onSelectObject,
  selectedObjectUuid
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`object-list-panel${expanded ? ' expanded' : ''}`}>  
      <button className="object-list-toggle" onClick={() => setExpanded((v) => !v)}>
        {expanded ? '↑ Ocultar Objetos' : '↓ Mostrar Objetos'}
      </button>
      {expanded && (
        <ul className="object-list">
          {objects.map((obj) => (
            <ObjectItem
              key={obj.uuid}
              object={obj}
              onToggleVisibility={onToggleVisibility}
              onSelectObject={onSelectObject}
              selectedObjectUuid={selectedObjectUuid}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default ObjectListPanel; 