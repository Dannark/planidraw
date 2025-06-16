import React from 'react';
import { OrbitControls } from '@react-three/drei';

interface ControlsProps {
  enableRotate: boolean;
  enablePan: boolean;
  enableZoom: boolean;
}

const Controls: React.FC<ControlsProps> = ({ enableRotate, enablePan, enableZoom }) => {
  return (
    <OrbitControls enableRotate={enableRotate} enablePan={enablePan} enableZoom={enableZoom} />
  );
};

export default Controls;
