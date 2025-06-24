import * as THREE from 'three';
import { Object3DItem } from '../components/ObjectListPanel/ObjectListPanel';

// Verifica se um objeto contém Mesh
export function hasMesh(obj: any): boolean {
  if (obj.type === 'Mesh') return true;
  if (obj.children && obj.children.length > 0) {
    return obj.children.some((child: any) => hasMesh(child));
  }
  return false;
}

// Encontra o segundo nível de parent de um objeto
export function findSecondLevelParent(object: THREE.Object3D, scene: THREE.Scene): THREE.Object3D {
  const parentList: THREE.Object3D[] = [];
  let current: THREE.Object3D | null = object;
  while (current && current !== scene) {
    parentList.push(current);
    current = current.parent;
  }
  if (parentList.length >= 2) {
    return parentList[parentList.length - 2];
  }
  return object;
}

// Busca recursiva por Object3DItem pelo UUID
export function findObject3DItem(uuid: string, objects: Object3DItem[]): Object3DItem | null {
  for (const obj of objects) {
    if (obj.uuid === uuid) return obj;
    if (obj.children) {
      const found = findObject3DItem(uuid, obj.children);
      if (found) return found;
    }
  }
  return null;
} 