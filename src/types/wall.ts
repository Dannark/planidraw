export type Slot = 'front' | 'back' | 'right' | 'left';

export interface SimpleWall {
  id: string;
  position: [number, number, number];
  length: number;
  height: number;
  thickness: number;
  rotationY: number;
  isNode?: false;
  nodeA?: ConnectionNode;
  nodeB?: ConnectionNode;
}

export interface ConnectionNode {
  id: string;
  position: [number, number, number];
  slots: {
    front?: SimpleWall | null;
    back?: SimpleWall | null;
    right?: SimpleWall | null;
    left?: SimpleWall | null;
  };
  isNode: true;
  thickness: number;
  height: number;
  length: number;
  rotationY: number;
} 