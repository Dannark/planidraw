import React, { useRef } from 'react';
import { OrthographicCamera, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import Wall from '../components/Wall';
import Controls from '../components/Controls';
import { useConfig } from '../config/ConfigContext';

const MainScene: React.FC = () => {
  const { is3D } = useConfig();
  const halfWallThickness = 0.15 / 2;
  const controlsRef = useRef<any>(null);  
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
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={'#717171'}
        cellColor={'#888'}
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid={true}
      />
      <Wall position={[0, 0, 0]}/>
      {/* <Wall position={[-3-halfWallThickness, 0, -3+halfWallThickness]} rotation={[0, (Math.PI / 2), 0]} /> */}
      <Controls enableRotate={is3D} enablePan={true} enableZoom={true} controlsRef={controlsRef} />
      <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
        <GizmoViewport axisColors={["#ff3653", "#8adb00", "#2c8fff"]} labelColor="white" />
      </GizmoHelper>
    </>
  );
};

export default MainScene;
