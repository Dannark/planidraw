import React, { useRef, useState, useEffect } from 'react';
import { OrthographicCamera, PerspectiveCamera, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import Controls from '../components/Controls/Controls';
import ImportControls from '../components/ImportControls/ImportControls';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useConfig } from '../config/ConfigContext';
import { Object3DItem } from '../components/ObjectListPanel/ObjectListPanel';

type ImportSceneProps = {
  gltfUrl: string | null;
  onObjectsUpdate?: (objects: Object3DItem[]) => void;
  onToggleVisibility?: (uuid: string, visible: boolean) => void;
};

const ImportScene: React.FC<ImportSceneProps> = ({ 
  gltfUrl, 
  onObjectsUpdate,
  onToggleVisibility 
}) => {
  const controlsRef = useRef<any>(null);
  const [gltf, setGltf] = useState<any>(null);
  const { is3D } = useConfig();

  useEffect(() => {
    console.log('[ImportScene] gltfUrl mudou:', gltfUrl);
    if (gltfUrl) {
      console.log('[ImportScene] Iniciando carregamento do modelo:', gltfUrl);
      const loader = new GLTFLoader();
      loader.load(
        gltfUrl,
        (loaded) => {
          console.log('[ImportScene] Modelo carregado com sucesso:', loaded);
          setGltf(loaded);
        },
        undefined,
        (error) => {
          console.error('[ImportScene] Erro ao carregar GLB:', error);
          setGltf(null);
        }
      );
    } else {
      setGltf(null);
    }
  }, [gltfUrl]);

  // Atualiza a lista de objetos sempre que o gltf muda
  useEffect(() => {
    if (gltf && gltf.scene && gltf.scene.children && onObjectsUpdate) {
      const list = gltf.scene.children.map((obj: any) => ({
        uuid: obj.uuid,
        type: obj.type,
        visible: obj.visible !== false,
        children: obj.children || []
      }));
      onObjectsUpdate(list);
    }
  }, [gltf, onObjectsUpdate]);

  // Callback para alternar visibilidade
  useEffect(() => {
    if (onToggleVisibility && gltf && gltf.scene) {
      const handleVisibilityChange = (event: CustomEvent) => {
        const { uuid, visible } = event.detail;
        const obj = gltf.scene.children.find((o: any) => o.uuid === uuid);
        if (obj) {
          obj.visible = visible;
        }
      };
      
      window.addEventListener('toggleVisibility', handleVisibilityChange as any);
      return () => {
        window.removeEventListener('toggleVisibility', handleVisibilityChange as any);
      };
    }
  }, [gltf, onToggleVisibility]);

  return (
    <>
      {is3D ? (
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={75} />
      ) : (
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
        cellThickness={1}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={'#717171'}
        cellColor={'#f6f6f6'}
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid={true}
      />
      {gltf && gltf.scene && (
        <primitive object={gltf.scene} position={[0, 0, 0]} />
      )}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
      <Controls enableRotate={is3D} enablePan={true} enableZoom={true} controlsRef={controlsRef} />
      <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
        <GizmoViewport axisColors={["#ff3653", "#8adb00", "#2c8fff"]} labelColor="white" />
      </GizmoHelper>
    </>
  );
};

export default ImportScene;