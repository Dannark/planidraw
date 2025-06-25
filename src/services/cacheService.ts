import { SceneConfig } from './modelService';

interface CachedModel {
  modelId: string;
  sceneConfig: SceneConfig;
  modelData: ArrayBuffer;
  lastAccessed: Date;
  size: number;
}

class CacheService {
  private readonly DB_NAME = 'planidraw-cache';
  private readonly STORE_NAME = 'models';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Criar store principal
        const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'modelId' });

        // Índices para busca e gerenciamento
        store.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        store.createIndex('size', 'size', { unique: false });
      };
    });
  }

  async cacheModel(modelId: string, sceneConfig: SceneConfig, modelData: ArrayBuffer): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database não inicializado');

    const cachedModel: CachedModel = {
      modelId,
      sceneConfig,
      modelData,
      lastAccessed: new Date(),
      size: modelData.byteLength
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);

      const request = store.put(cachedModel);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      // Limpar cache antigo se necessário
      this.cleanCacheIfNeeded();
    });
  }

  async getCachedModel(modelId: string): Promise<CachedModel | null> {
    await this.init();
    if (!this.db) throw new Error('Database não inicializado');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(modelId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const model = request.result;
        if (model) {
          // Atualizar lastAccessed
          this.updateLastAccessed(modelId);
          resolve(model);
        } else {
          resolve(null);
        }
      };
    });
  }

  private async updateLastAccessed(modelId: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);
    const request = store.get(modelId);

    request.onsuccess = () => {
      const model = request.result;
      if (model) {
        model.lastAccessed = new Date();
        store.put(model);
      }
    };
  }

  private async cleanCacheIfNeeded(): Promise<void> {
    if (!this.db) return;

    const MAX_CACHE_SIZE = 1024 * 1024 * 1024; // 1GB
    const MAX_AGE_DAYS = 7;

    const transaction = this.db.transaction(this.STORE_NAME, 'readwrite');
    const store = transaction.objectStore(this.STORE_NAME);
    const sizeIndex = store.index('size');
    const lastAccessedIndex = store.index('lastAccessed');

    // Remover modelos antigos
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - MAX_AGE_DAYS);

    lastAccessedIndex.openCursor(IDBKeyRange.upperBound(cutoffDate)).onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    // Verificar tamanho total e remover se necessário
    let totalSize = 0;
    sizeIndex.openCursor().onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        totalSize += cursor.value.size;
        if (totalSize > MAX_CACHE_SIZE) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }
}

export const cacheService = new CacheService();
