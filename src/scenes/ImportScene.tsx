import React, { memo, useEffect, useRef, useState } from 'react';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3DItem } from '../components/ObjectListPanel/ObjectListPanel';
import { useConfig } from '../config/ConfigContext';
import * as THREE from 'three';
import { OrthographicCamera, PerspectiveCamera, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import Controls from '../components/Controls/Controls';
import { useCameraKeyboardNavigation } from '../hooks/useCameraKeyboardNavigation';
import { hasMesh, findSecondLevelParent, findObject3DItem } from '../utils/objectUtils';
import { useObjectImport } from '../hooks/useObjectImport';
import { useObjectSelection } from '../hooks/useObjectSelection';
import { useSelectionHighlight } from '../hooks/useSelectionHighlight';

interface ImportSceneProps {
  gltfUrl: string | null;
  onObjectsUpdate: (objects: Object3DItem[]) => void;
  onObjectClick: (object: Object3DItem) => void;
  selectedObjectUuid?: string;
}

const ImportScene: React.FC<ImportSceneProps> = ({ gltfUrl, onObjectsUpdate, onObjectClick, selectedObjectUuid }) => {
  const { gltf, objectList, isLoading, error } = useObjectImport(gltfUrl);
  const { is3D } = useConfig();
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  // Armazena a última posição e alvo conhecidos da câmera.
  const lastCameraState = useRef({
    position: new THREE.Vector3(0, 10, 20),
    target: new THREE.Vector3(0, 0, 0),
  });

  // Salva continuamente o estado da câmera em um ref, sem causar re-renderizações.
  useFrame(() => {
    if (controlsRef.current) {
      lastCameraState.current.position.copy(camera.position);
      lastCameraState.current.target.copy(controlsRef.current.target);
    }
  });

  // Efeito para gerenciar a transição suave entre as câmeras 2D e 3D.
  useEffect(() => {
    if (is3D) {
      // Restaura posição, alvo e up do último estado 3D
      const { position, target } = lastCameraState.current;
      camera.position.copy(position);
      if (controlsRef.current) {
        controlsRef.current.target.copy(target);
      }
      camera.up.set(0, 1, 0);
      if (controlsRef.current) controlsRef.current.update();
    } else {
      // Preserva a posição, mas força a orientação para planta baixa
      const { position, target } = lastCameraState.current;
      camera.position.copy(position);
      
      if (controlsRef.current) {
        controlsRef.current.target.set(camera.position.x, 0, camera.position.z);
      }
      camera.up.set(0, 1, 0);
      camera.lookAt(camera.position.x, 0, camera.position.z);
      if (controlsRef.current) controlsRef.current.update();
    }
  }, [is3D, camera]);

  useEffect(() => {
    if (objectList) {
      onObjectsUpdate(objectList);
    }
  }, [objectList, onObjectsUpdate]);

  // Seleção e highlight
  const { selectedObject, selectObject, selectedObjectRef } = useObjectSelection(camera, controlsRef, is3D);
  useSelectionHighlight(selectedObject, gltf);

  // Handler para início do clique
  const handleMouseDown = (event: MouseEvent) => {
    mouseDownPos.current = { x: event.clientX, y: event.clientY };
    isDragging.current = false;
  };

  // Handler para movimento do mouse
  const handleMouseMove = (event: MouseEvent) => {
    if (mouseDownPos.current) {
      const deltaX = Math.abs(event.clientX - mouseDownPos.current.x);
      const deltaY = Math.abs(event.clientY - mouseDownPos.current.y);
      if (deltaX > 3 || deltaY > 3) {
        isDragging.current = true;
      }
    }
  };

  // Handler para fim do clique
  const handleMouseUp = (event: MouseEvent) => {
    if (!isDragging.current && mouseDownPos.current) {
      handleSceneClick(event);
    }
    mouseDownPos.current = null;
  };

  // Adiciona os listeners de mouse
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gl, gltf, camera]);

  // Atualizar handleSceneClick para usar selectObject
  const handleSceneClick = (event: MouseEvent) => {
    console.log('🎯 [ImportScene] handleSceneClick');
    if (!gltf || !gltf.scene || !camera) return;
    const bounds = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.current.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(gltf.scene.children, true);

    // Filtra objetos de highlight
    const validIntersects = intersects.filter(
      (i) =>
        i.object.name !== 'selection-highlight' &&
        i.object.name !== 'selection-box'
    );

    if (validIntersects.length > 0) {
      const clickedObject = validIntersects[0].object;
      const parentObject = findSecondLevelParent(clickedObject, gltf.scene);
      selectObject(parentObject || clickedObject);
      // Atualize o estado global de seleção aqui, se necessário
      if (parentObject?.uuid) {
        onObjectClick({ uuid: parentObject.uuid, type: parentObject.type, visible: parentObject.visible });
      }
    } else {
      selectObject(null);
      // Atualize o estado global de seleção aqui, se necessário
      // onObjectClick(null);
    }
  };

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

  useCameraKeyboardNavigation(is3D, camera, controlsRef);

  useEffect(() => {
    if (!selectedObjectUuid || !gltf) {
      selectObject(null);
      return;
    }
    // Busca recursiva pelo UUID no gltf.scene
    const findByUuid = (obj: any, uuid: string): any => {
      if (obj.uuid === uuid) return obj;
      if (obj.children) {
        for (const child of obj.children) {
          const found = findByUuid(child, uuid);
          if (found) return found;
        }
      }
      return null;
    };
    const obj = findByUuid(gltf.scene, selectedObjectUuid);
    selectObject(obj);
  }, [selectedObjectUuid, gltf]);

  if (!gltf) {
    return null;
  }

  return (
    <>
      {!is3D && (
        <OrthographicCamera
          makeDefault
          // position={cameraPosition}
          // up={[0, 0, -1]}
          near={1}
          far={1000}
          zoom={100}
        />
      )}
      {is3D && (
        <PerspectiveCamera
          makeDefault
          // position={cameraPosition}
          fov={75}
        />
      )}
      {/* {!is3D && (
        <>
          <ambientLight intensity={3} />
          <directionalLight
            position={[30, 10, 30]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
          />
        </>
      )} */}
      {/* <pointLight position={[0, 5, 0]} intensity={10} /> */}

      {true && (
        <>
          <ambientLight intensity={1} />
          <directionalLight
            position={[30, 10, 30]}
            intensity={4}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
          />
        </>
      )}
      <color attach="background" args={["rgb(48, 48, 53)"]} />
      <Grid
        position={[0, -0.01, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={1}
        sectionSize={5}
        sectionThickness={1}
        sectionColor={'#9d4b4b'}
        cellColor={'#6f6f6f'}
        fadeDistance={30}
        fadeStrength={1}
        infiniteGrid={true}
      />
      <primitive receiveShadow castShadow object={gltf.scene} position={[0, 0, 0]} />
      <Controls enableRotate={is3D} enablePan={true} enableZoom={true} controlsRef={controlsRef} />
      {/* <Environment preset="city" /> */}
      <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
        <GizmoViewport axisColors={['#9d4b4b', '#2f7f4f', '#3b5b9d']} labelColor="white" />
      </GizmoHelper>
    </>
  );
};

export default ImportScene;