import { useEffect, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3DItem } from '../components/ObjectListPanel/ObjectListPanel';
import { hasMesh } from '../utils/objectUtils';

export function useObjectImport(gltfUrl: string | null) {
  const [gltf, setGltf] = useState<any>(null);
  const [objectList, setObjectList] = useState<Object3DItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gltfUrl) {
      setGltf(null);
      setObjectList([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    const loader = new GLTFLoader();
    loader.load(
      gltfUrl,
      (gltf) => {
        // Mapeia e filtra os objetos uma única vez após carregar
        const mapObject = (obj: any, parent: Object3DItem | null = null): Object3DItem => ({
          uuid: obj.uuid,
          type: obj.type,
          visible: obj.visible !== false,
          parent: parent,
          children: obj.children?.map((child: any) => mapObject(child, obj)) || []
        });
        // Filtra apenas os objetos que contêm Mesh
        const filteredObjects = gltf.scene.children
          .filter(obj => hasMesh(obj))
          .map(obj => mapObject(obj, null));
        setGltf(gltf);
        setObjectList(filteredObjects);
        setIsLoading(false);
      },
      undefined,
      (err) => {
        setError('Erro ao carregar GLTF');
        setIsLoading(false);
      }
    );
  }, [gltfUrl]);

  return { gltf, objectList, isLoading, error };
}
