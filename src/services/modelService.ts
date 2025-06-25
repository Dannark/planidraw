import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { cacheService } from './cacheService';

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
    cameraTarget?: { x: number; y: number; z: number },
    onProgress?: (progress: number) => void
  ): Promise<SceneConfig> {
    try {
      const modelId = uuidv4();
      const modelStorageRef = ref(storage, `models/${modelId}/${file.name}`);
      
      const uploadModelPromise = new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(modelStorageRef, file);
        
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error) => {
            console.error('Erro durante o upload:', error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (urlError) {
              console.error('Erro ao gerar URL de download:', urlError);
              reject(urlError);
            }
          }
        );
      });
      
      const glbUrl = await uploadModelPromise;
      
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

      const sceneJsonRef = ref(storage, `models/${modelId}/scene.json`);
      const sceneJsonBlob = new Blob([JSON.stringify(sceneConfig)], { type: 'application/json' });
      await uploadBytesResumable(sceneJsonRef, sceneJsonBlob);
      
      return sceneConfig;
    } catch (error) {
      console.error('Erro ao fazer upload do modelo:', error);
      throw error;
    }
  }
  
  static async getModelById(modelId: string): Promise<SceneConfig | null> {
    try {
      // Tentar buscar do cache primeiro
      const cachedModel = await cacheService.getCachedModel(modelId);
      if (cachedModel) {
        console.log('🎯 Modelo encontrado no cache:', modelId);
        return cachedModel.sceneConfig;
      }

      // Se não estiver no cache, buscar do Firebase
      const sceneJsonRef = ref(storage, `models/${modelId}/scene.json`);
      const sceneJsonUrl = await getDownloadURL(sceneJsonRef);
      
      const response = await fetch(sceneJsonUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const sceneConfig = await response.json() as SceneConfig;
      return sceneConfig;
    } catch (error) {
      console.error('Erro ao buscar modelo:', error);
      throw error;
    }
  }
  
  static async downloadModel(glbUrl: string, modelId: string, sceneConfig: SceneConfig): Promise<ArrayBuffer> {
    try {
      // Verificar cache primeiro
      const cachedModel = await cacheService.getCachedModel(modelId);
      if (cachedModel) {
        console.log('🎯 Dados do modelo encontrados no cache:', modelId);
        return cachedModel.modelData;
      }

      // Se não estiver no cache, baixar
      console.log('🎯 Baixando modelo do Firebase:', modelId);
      const response = await fetch(glbUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const modelData = await response.arrayBuffer();

      // Salvar no cache
      await cacheService.cacheModel(modelId, sceneConfig, modelData);
      console.log('🎯 Modelo salvo no cache:', modelId);

      return modelData;
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      throw error;
    }
  }
} 