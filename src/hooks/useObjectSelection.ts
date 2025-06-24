import { useState, useRef, useCallback } from 'react';
import * as THREE from 'three';

export function useObjectSelection(camera: THREE.Camera, controlsRef: React.RefObject<any>, is3D: boolean) {
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
  const selectedObjectRef = useRef<THREE.Object3D | null>(null);

  // Função para selecionar um objeto e focar a câmera
  const selectObject = useCallback((object: THREE.Object3D | null) => {
    setSelectedObject(object);
    selectedObjectRef.current = object;
    if (object && camera) {
      const bbox = new THREE.Box3().setFromObject(object);
      const size = bbox.getSize(new THREE.Vector3());
      const center = bbox.getCenter(new THREE.Vector3());
      const distance = 10;
      if (!is3D) {
        camera.position.set(center.x, center.y + distance, center.z);
        camera.up.set(0, 0, -1);
      } else {
        const angle = Math.PI / 4;
        const offsetZ = Math.sin(angle) * distance;
        const offsetY = Math.cos(angle) * distance;
        camera.position.set(center.x, center.y + offsetY, center.z + offsetZ);
        camera.up.set(0, 1, 0);
      }
      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }
    }
  }, [camera, controlsRef, is3D]);

  return {
    selectedObject,
    selectObject,
    selectedObjectRef,
  };
}
