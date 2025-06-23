import React, { memo, useEffect, useRef, useState } from 'react';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3DItem } from '../components/ObjectListPanel/ObjectListPanel';
import { useConfig } from '../config/ConfigContext';
import * as THREE from 'three';
import { OrthographicCamera, PerspectiveCamera, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import Controls from '../components/Controls/Controls';
import { useCameraKeyboardNavigation } from '../hooks/useCameraKeyboardNavigation';

interface ImportSceneProps {
  gltfUrl: string | null;
  onObjectsUpdate: (objects: Object3DItem[]) => void;
  onObjectClick: (object: Object3DItem) => void;
}

// Função auxiliar para verificar se um objeto contém Mesh
const hasMesh = (obj: any): boolean => {
  // Se o próprio objeto é um Mesh, retorna true
  if (obj.type === 'Mesh') {
    return true;
  }

  // Se tem filhos, verifica recursivamente
  if (obj.children && obj.children.length > 0) {
    return obj.children.some((child: any) => hasMesh(child));
  }

  // Se não é Mesh e não tem filhos, retorna false
  return false;
};

const ImportScene: React.FC<ImportSceneProps> = ({ gltfUrl, onObjectsUpdate, onObjectClick }) => {
  const [gltf, setGltf] = useState<any>(null);
  const { is3D } = useConfig();
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const selectedObjectRef = useRef<THREE.Object3D | null>(null);
  const boundingBoxRef = useRef<THREE.LineSegments | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const [orthoPosition, setOrthoPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 10, 0));
  const [perspectivePosition, setPerspectivePosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 5, 10));
  const [cameraPosition, setCameraPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 10, 0));

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
    if (gltfUrl) {
      const loader = new GLTFLoader();
      loader.load(gltfUrl, (gltf) => {
        console.log('Arquivo GLTF carregado, filtrando objetos sem mesh...');
        
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

        // Atualiza a lista de objetos filtrada
        onObjectsUpdate(filteredObjects);
        
        // Atualiza o estado com o GLTF
        setGltf(gltf);
      });
    }
  }, [gltfUrl]);

  // Função para encontrar o objeto pai apropriado
  const findSecondLevelParent = (object: THREE.Object3D): THREE.Object3D => {
    const parentList: THREE.Object3D[] = [];
    let current: THREE.Object3D | null = object;

    // Monta a lista de parents até a raiz (gltf.scene)
    while (current && current !== gltf.scene) {
      parentList.push(current);
      current = current.parent;
    }

    console.log('Lista de parents:', parentList.map(obj => ({ 
      uuid: obj.uuid, 
      type: obj.type,
      name: obj.name
    })));

    // Se tiver pelo menos 2 itens na lista, retorna o penúltimo
    // Caso contrário, retorna o próprio objeto
    if (parentList.length >= 2) {
      return parentList[parentList.length - 2];
    }

    return object;
  };

  // Função para encontrar o Object3DItem correspondente ao UUID
  const findObject3DItem = (uuid: string, objects: Object3DItem[]): Object3DItem | null => {
    for (const obj of objects) {
      if (obj.uuid === uuid) return obj;
      if (obj.children) {
        const found = findObject3DItem(uuid, obj.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Handler para início do clique
  const handleMouseDown = (event: MouseEvent) => {
    mouseDownPos.current = { x: event.clientX, y: event.clientY };
    isDragging.current = false;
  };

  // Handler para movimento do mouse
  const handleMouseMove = (event: MouseEvent) => {
    if (mouseDownPos.current) {
      // Verifica se o mouse moveu mais que 3 pixels em qualquer direção
      const deltaX = Math.abs(event.clientX - mouseDownPos.current.x);
      const deltaY = Math.abs(event.clientY - mouseDownPos.current.y);
      if (deltaX > 3 || deltaY > 3) {
        isDragging.current = true;
      }
    }
  };

  // Handler para fim do clique
  const handleMouseUp = (event: MouseEvent) => {
    // Só processa o clique se não houve arrasto
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

  // Remove o antigo listener de clique direto e move a lógica para handleSceneClick
  const handleSceneClick = (event: MouseEvent) => {
    if (!gltf || !gltf.scene || !camera) return;

    // Remove highlights anteriores antes de fazer a nova seleção
    if (boundingBoxRef.current) {
      gltf.scene.remove(boundingBoxRef.current);
      boundingBoxRef.current = null;
    }
    
    const existingBox = gltf.scene.getObjectByName('selection-box');
    if (existingBox) {
      gltf.scene.remove(existingBox);
    }

    // Calcula as coordenadas normalizadas do mouse (-1 a 1)
    const bounds = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.current.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

    // Atualiza o raycaster
    raycaster.current.setFromCamera(mouse.current, camera);

    // Obtém todos os objetos intersectados
    const intersects = raycaster.current.intersectObjects(gltf.scene.children, true);

    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      const parentObject = findSecondLevelParent(clickedObject);
      onObjectClick(parentObject || clickedObject);

      const event = new CustomEvent('selectObject', {
        detail: { 
          object: { 
            uuid: parentObject.uuid,
            type: parentObject.type,
            visible: parentObject.visible
          } 
        }
      });
      window.dispatchEvent(event);
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

  // Callback para selecionar objeto
  useEffect(() => {
    const handleSelectObject = (event: CustomEvent) => {
      const { object } = event.detail;
      console.log('🔍 [ImportScene] Recebido evento de seleção:', {
        uuid: object.uuid,
        type: object.type,
        visible: object.visible
      });
      
      if (gltf && gltf.scene) {
        console.log('📦 [ImportScene] GLTF carregado, procurando objeto...');
        
        // Remove o highlight anterior
        if (boundingBoxRef.current) {
          console.log('🗑️ [ImportScene] Removendo highlight anterior');
          gltf.scene.remove(boundingBoxRef.current);
          boundingBoxRef.current = null;
        }
        
        // Remove o box sólido anterior
        const existingBox = gltf.scene.getObjectByName('selection-box');
        if (existingBox) {
          console.log('🗑️ [ImportScene] Removendo box anterior');
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
          console.log('✅ [ImportScene] Objeto encontrado na cena:', {
            uuid: selectedObj.uuid,
            type: selectedObj.type,
            position: selectedObj.position,
            visible: selectedObj.visible
          });
          
          selectedObjectRef.current = selectedObj;
          
          // Cria um bounding box para highlight
          const bbox = new THREE.Box3().setFromObject(selectedObj);
          const size = bbox.getSize(new THREE.Vector3());
          const center = bbox.getCenter(new THREE.Vector3());
          
          console.log('📏 [ImportScene] Bounding box calculado:', {
            size: { x: size.x, y: size.y, z: size.z },
            center: { x: center.x, y: center.y, z: center.z }
          });
          
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
          console.log('🎨 [ImportScene] Wireframe highlight criado');

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
            // const distance = Math.max(size.x, size.y, size.z) * 2;
            const distance = 10;
            console.log('📷 [ImportScene] Ajustando câmera, distância:', distance);
            
            if (!is3D) {
              // Câmera ortográfica: sempre de cima para baixo (eixo Y)
              camera.position.set(center.x, center.y + distance, center.z);

              // camera.lookAt(center.x, center.y, center.z);
              camera.up.set(0, 0, -1); // Mantém o eixo Z- para frente
              console.log('📷 [ImportScene] Câmera ortográfica ajustada');
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
              // camera.lookAt(center.x, center.y, center.z);
              // camera.up.set(0, 1, 0); // Mantém o eixo Z- para frente
            }
            
            // Atualiza os controles se disponível
            if (controlsRef.current) {
              controlsRef.current.target.copy(center);
              controlsRef.current.update();
            }
          }
        } else {
          console.warn('❌ [ImportScene] Objeto não encontrado na cena:', object.uuid);
        }
      } else {
        console.warn('❌ [ImportScene] GLTF não carregado');
      }
    };

    window.addEventListener('selectObject', handleSelectObject as any);
    return () => {
      window.removeEventListener('selectObject', handleSelectObject as any);
    };
  }, [gltf, camera, controlsRef, is3D]);

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

  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });


  useCameraKeyboardNavigation(is3D, camera, controlsRef);

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