import React, { useEffect, useRef, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3DItem } from '../components/ObjectListPanel/ObjectListPanel';
import { useThree } from '@react-three/fiber';
import { useConfig } from '../config/ConfigContext';
import * as THREE from 'three';
import { OrthographicCamera, PerspectiveCamera, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import Controls from '../components/Controls/Controls';

interface ImportSceneProps {
  gltfUrl: string | null;
  onObjectsUpdate: (objects: Object3DItem[]) => void;
}

const ImportScene: React.FC<ImportSceneProps> = ({ gltfUrl, onObjectsUpdate }) => {
  const [gltf, setGltf] = useState<any>(null);
  const { is3D } = useConfig();
  const { camera, controls } = useThree();
  const controlsRef = useRef<any>(null);
  const selectedObjectRef = useRef<THREE.Object3D | null>(null);
  const boundingBoxRef = useRef<THREE.LineSegments | null>(null);

  useEffect(() => {
    if (gltfUrl) {
      const loader = new GLTFLoader();
      loader.load(gltfUrl, (gltf) => {
        setGltf(gltf);
      });
    }
  }, [gltfUrl]);

  // Atualiza a lista de objetos quando o GLTF é carregado
  useEffect(() => {
    if (gltf && gltf.scene && gltf.scene.children && onObjectsUpdate) {
      const mapObject = (obj: any): Object3DItem => ({
        uuid: obj.uuid,
        type: obj.type,
        visible: obj.visible !== false,
        children: obj.children?.map(mapObject) || []
      });

      const list = gltf.scene.children.map(mapObject);
      onObjectsUpdate(list);
    }
  }, [gltf, onObjectsUpdate]);

  // Callback para alternar visibilidade
  useEffect(() => {
    const handleVisibilityChange = (event: CustomEvent) => {
      const { object } = event.detail;
      if (gltf && gltf.scene) {
        const traverse = (obj: any) => {
          if (obj.uuid === object.uuid) {
            obj.visible = !object.visible;
            return true;
          }
          if (obj.children) {
            for (const child of obj.children) {
              if (traverse(child)) return true;
            }
          }
          return false;
        };
        traverse(gltf.scene);
      }
    };

    window.addEventListener('toggleVisibility', handleVisibilityChange as any);
    return () => {
      window.removeEventListener('toggleVisibility', handleVisibilityChange as any);
    };
  }, [gltf]);

  // Callback para selecionar objeto
  useEffect(() => {
    const handleSelectObject = (event: CustomEvent) => {
      const { object } = event.detail;
      if (gltf && gltf.scene) {
        // Remove o highlight anterior
        if (boundingBoxRef.current) {
          gltf.scene.remove(boundingBoxRef.current);
          boundingBoxRef.current = null;
        }
        
        // Remove o box sólido anterior
        const existingBox = gltf.scene.getObjectByName('selection-box');
        if (existingBox) {
          gltf.scene.remove(existingBox);
        }
        
        // Encontra o objeto na cena
        const findObject = (obj: any): THREE.Object3D | null => {
          if (obj.uuid === object.uuid) {
            return obj;
          }
          if (obj.children) {
            for (const child of obj.children) {
              const found = findObject(child);
              if (found) return found;
            }
          }
          return null;
        };

        const selectedObj = findObject(gltf.scene);
        if (selectedObj) {
          selectedObjectRef.current = selectedObj;
          
          // Cria um bounding box para highlight
          const bbox = new THREE.Box3().setFromObject(selectedObj);
          const size = bbox.getSize(new THREE.Vector3());
          const center = bbox.getCenter(new THREE.Vector3());
          
          // Cria um wireframe box mais visível
          const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
          const material = new THREE.LineBasicMaterial({ 
            color: 0x00ff00, // Verde mais vibrante
            linewidth: 4, // Linha mais grossa
            transparent: true,
            opacity: 1.0, // Opacidade total
            depthTest: false, // Sempre renderiza por cima
            depthWrite: false // Não escreve no depth buffer
          });
          const wireframe = new THREE.LineSegments(
            new THREE.WireframeGeometry(geometry),
            material
          );
          
          wireframe.position.copy(center);
          wireframe.name = 'selection-highlight';
          wireframe.renderOrder = 999; // Renderiza por último (por cima)
          gltf.scene.add(wireframe);
          boundingBoxRef.current = wireframe;

          // Adiciona também um box sólido semi-transparente para mais destaque
          const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z);
          const boxMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.1,
            depthTest: false,
            depthWrite: false
          });
          const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
          boxMesh.position.copy(center);
          boxMesh.name = 'selection-box';
          boxMesh.renderOrder = 998;
          gltf.scene.add(boxMesh);

          // Foca a câmera no objeto selecionado
          if (camera) {
            const distance = Math.max(size.x, size.y, size.z) * 2;
            
            if (!is3D) {
              // Câmera ortográfica: sempre de cima para baixo (eixo Y)
              camera.position.set(center.x, center.y + distance, center.z);
              camera.lookAt(center.x, center.y, center.z);
              camera.up.set(0, 0, -1); // Mantém o eixo Z- para frente
            } else {
              // Câmera 3D: 45° de inclinação de cima para baixo
              const angle = Math.PI / 4; // 45 graus
              const offsetZ = Math.sin(angle) * distance;
              const offsetY = Math.cos(angle) * distance;
              
              camera.position.set(
                center.x,
                center.y + offsetY,
                center.z + offsetZ
              );
              camera.lookAt(center.x, center.y, center.z);
              camera.up.set(0, 1, 0); // Mantém o eixo Z- para frente
            }
            
            // Atualiza os controles se disponível
            if (controls && (controls as any).target) {
              (controls as any).target.copy(center);
              (controls as any).update();
            }
          }
        }
      }
    };

    window.addEventListener('selectObject', handleSelectObject as any);
    return () => {
      window.removeEventListener('selectObject', handleSelectObject as any);
    };
  }, [gltf, camera, controls, is3D]);

  // Cleanup do highlight quando a cena muda
  useEffect(() => {
    return () => {
      if (gltf && gltf.scene) {
        if (boundingBoxRef.current) {
          gltf.scene.remove(boundingBoxRef.current);
          boundingBoxRef.current = null;
        }
        
        const existingBox = gltf.scene.getObjectByName('selection-box');
        if (existingBox) {
          gltf.scene.remove(existingBox);
        }
      }
    };
  }, [gltf]);

  if (!gltf) {
    return null;
  }

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
      {is3D && (
        <PerspectiveCamera
          makeDefault
          position={[0, 5, 10]}
          fov={75}
        />
      )}
      <ambientLight intensity={5} />
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
      <primitive object={gltf.scene} position={[0, 0, 0]} />
      <Controls enableRotate={is3D} enablePan={true} enableZoom={true} controlsRef={controlsRef} />
      <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
        <GizmoViewport axisColors={["#ff3653", "#8adb00", "#2c8fff"]} labelColor="white" />
      </GizmoHelper>
    </>
  );
};

export default ImportScene;