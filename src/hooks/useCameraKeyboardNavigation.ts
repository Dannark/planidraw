import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function useCameraKeyboardNavigation(
  is3D: boolean,
  camera: THREE.Camera,
  controlsRef: React.RefObject<any>
) {
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!is3D) return;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') moveState.current.forward = true;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') moveState.current.backward = true;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveState.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') moveState.current.right = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') moveState.current.forward = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') moveState.current.backward = false;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') moveState.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') moveState.current.right = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [is3D]);

  useFrame((_, delta) => {
    if (!is3D) return;
    const speed = 5; // metros por segundo
    const move = moveState.current;
    let direction = new THREE.Vector3();

    if (move.forward) direction.z += 1;
    if (move.backward) direction.z -= 1;
    if (move.left) direction.x += 1;
    if (move.right) direction.x -= 1;

    if (direction.lengthSq() > 0) {
      direction.normalize();
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0;
      cameraDirection.normalize();

      const cameraRight = new THREE.Vector3();
      cameraRight.crossVectors(cameraDirection, camera.up).normalize();

      const moveVector = new THREE.Vector3();
      moveVector.addScaledVector(cameraDirection, direction.z);
      moveVector.addScaledVector(cameraRight, -direction.x);
      moveVector.normalize().multiplyScalar(speed * delta);

      camera.position.add(moveVector);
      if (controlsRef.current) {
        controlsRef.current.target.add(moveVector);
        controlsRef.current.update();
      }
    }
  });
} 