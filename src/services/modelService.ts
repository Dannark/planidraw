import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { storage, db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

export interface SceneConfig {
  id: string;
  name: string;
  description?: string;
  glbUrl: string;
  createdAt: Date;
  updatedAt: Date;
  cameraPosition?: {
    x: number;
    y: number;
    z: number;
  };
  cameraTarget?: {
    x: number;
    y: number;
    z: number;
  };
}

export class ModelService {
  static async uploadModel(
    file: File,
    name: string,
    description?: string,
    cameraPosition?: { x: number; y: number; z: number },
    cameraTarget?: { x: number; y: number; z: number }
  ): Promise<SceneConfig> {
    try {
      // Gerar ID único para o modelo
      const modelId = uuidv4();
      
      // Upload do arquivo GLB para o Firebase Storage
      const storageRef = ref(storage, `models/${modelId}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const glbUrl = await getDownloadURL(snapshot.ref);
      
      // Criar configuração da cena
      const sceneConfig: SceneConfig = {
        id: modelId,
        name,
        description,
        glbUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
        cameraPosition,
        cameraTarget
      };
      
      // Salvar configuração no Firestore
      await setDoc(doc(db, 'scenes', modelId), sceneConfig);
      
      return sceneConfig;
    } catch (error) {
      console.error('Erro ao fazer upload do modelo:', error);
      throw error;
    }
  }
  
  static async getModelById(modelId: string): Promise<SceneConfig | null> {
    try {
      const docRef = doc(db, 'scenes', modelId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as SceneConfig;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar modelo:', error);
      throw error;
    }
  }
  
  static async downloadModel(glbUrl: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(glbUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.arrayBuffer();
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      throw error;
    }
  }
} 