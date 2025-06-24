import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function useSelectionHighlight(selectedObject: THREE.Object3D | null, gltf: any) {
  const boundingBoxRef = useRef<THREE.LineSegments | null>(null);
  const boxMeshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!gltf || !gltf.scene) return;

    // Remove highlight anterior
    if (boundingBoxRef.current) {
      gltf.scene.remove(boundingBoxRef.current);
      boundingBoxRef.current = null;
    }
    if (boxMeshRef.current) {
      gltf.scene.remove(boxMeshRef.current);
      boxMeshRef.current = null;
    }

    if (selectedObject) {
      // Cria wireframe highlight
      const bbox = new THREE.Box3().setFromObject(selectedObject);
      const size = bbox.getSize(new THREE.Vector3());
      const center = bbox.getCenter(new THREE.Vector3());
      const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      const material = new THREE.LineBasicMaterial({ 
        color: 0x00ff00,
        linewidth: 4,
        transparent: true,
        opacity: 1.0,
        depthTest: false,
        depthWrite: false
      });
      const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        material
      );
      wireframe.position.copy(center);
      wireframe.name = 'selection-highlight';
      wireframe.renderOrder = 999;
      gltf.scene.add(wireframe);
      boundingBoxRef.current = wireframe;

      // Cria box sólido semi-transparente verde
      const boxMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.15,
        depthTest: false,
        depthWrite: false
      });
      const boxMesh = new THREE.Mesh(geometry, boxMaterial);
      boxMesh.position.copy(center);
      boxMesh.name = 'selection-box';
      boxMesh.renderOrder = 998;
      gltf.scene.add(boxMesh);
      boxMeshRef.current = boxMesh;
    }

    // Cleanup ao desmontar
    return () => {
      if (gltf && gltf.scene && boundingBoxRef.current) {
        gltf.scene.remove(boundingBoxRef.current);
        boundingBoxRef.current = null;
      }
      if (gltf && gltf.scene && boxMeshRef.current) {
        gltf.scene.remove(boxMeshRef.current);
        boxMeshRef.current = null;
      }
    };
  }, [selectedObject, gltf]);

  return { boundingBoxRef, boxMeshRef };
}
