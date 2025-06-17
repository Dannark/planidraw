import React, { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import './Controls.css';

interface ControlsProps {
  enableRotate: boolean;
  enablePan: boolean;
  enableZoom: boolean;
  controlsRef: React.RefObject<any>;
}

const Controls: React.FC<ControlsProps> = ({ enableRotate, enablePan, enableZoom, controlsRef }) => {
  return (
    <OrbitControls
      enableRotate={enableRotate}
      enablePan={enablePan}
      enableZoom={enableZoom}
      ref={controlsRef}
      makeDefault />
  );
};

export default Controls;
