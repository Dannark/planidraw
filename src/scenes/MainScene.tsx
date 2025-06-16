import React from 'react';
import { OrthographicCamera } from '@react-three/drei';
import Wall from '../components/Wall';
import Controls from '../components/Controls';
import { useConfig } from '../config/ConfigContext';

const MainScene: React.FC = () => {
  const { is3D } = useConfig();
  const halfWallThickness = 0.15 / 2;
  return (
    <>
      {!is3D && (
        <OrthographicCamera
          makeDefault
          position={[0, 10, 0]}
          up={[0, 0, -1]}
          near={1}
          far={1000}
          zoom={100}
        />
      )}
      <ambientLight intensity={10} />
      <pointLight position={[10, 10, 10]} />
      <Wall position={[0, 0, 0]}/>
      <Wall position={[-3-halfWallThickness, 0, -3+halfWallThickness]} rotation={[0, (Math.PI / 2), 0]} />
      <Controls enableRotate={is3D} enablePan={true} enableZoom={true} />
    </>
  );
};

export default MainScene;
