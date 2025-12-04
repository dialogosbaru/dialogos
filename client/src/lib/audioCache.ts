/**
 * Sistema de caché de audio usando IndexedDB
 * Almacena audios generados por TTS para evitar llamadas repetidas a la API
 */

const DB_NAME = 'dialogos-audio-cache';
const STORE_NAME = 'audio';
const DB_VERSION = 1;
const MAX_CACHE_SIZE_MB = 50; // Límite de 50 MB
const CACHE_TTL_DAYS = 7; // Tiempo de vida de 7 días

interface CachedAudio {
  key: string;
  audioContent: string; // Base64
  mimeType: string;
  timestamp: number;
  size: number; // Tamaño en bytes
}

/**
 * Inicializa la base de datos IndexedDB
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Crear object store si no existe
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Genera una clave única para el caché basada en texto, emoción y voz
 */
export function generateCacheKey(
  text: string,
  emotion: string,
  voiceName: string
): string {
  // Normalizar el texto (minúsculas, sin espacios extras)
  const normalizedText = text.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Crear hash simple (para evitar claves muy largas)
  const hash = `${normalizedText}|${emotion}|${voiceName}`;
  
  return btoa(hash); // Codificar en base64 para usar como clave
}

/**
 * Obtiene un audio del caché
 */
export async function getAudioFromCache(
  text: string,
  emotion: string,
  voiceName: string
): Promise<{ audioContent: string; mimeType: string } | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const key = generateCacheKey(text, emotion, voiceName);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cached = request.result as CachedAudio | undefined;
        
        if (!cached) {
          resolve(null);
          return;
        }

        // Verificar si el caché ha expirado
        const now = Date.now();
        const age = now - cached.timestamp;
        const maxAge = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;

        if (age > maxAge) {
          console.log('[Audio Cache] Cache expired, removing:', key);
          // Eliminar caché expirado
          const deleteTransaction = db.transaction(STORE_NAME, 'readwrite');
          const deleteStore = deleteTransaction.objectStore(STORE_NAME);
          deleteStore.delete(key);
          resolve(null);
          return;
        }

        console.log('[Audio Cache] Cache hit:', key);
        resolve({
          audioContent: cached.audioContent,
          mimeType: cached.mimeType,
        });
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Audio Cache] Error getting from cache:', error);
    return null;
  }
}

/**
 * Guarda un audio en el caché
 */
export async function saveAudioToCache(
  text: string,
  emotion: string,
  voiceName: string,
  audioContent: string,
  mimeType: string
): Promise<void> {
  try {
    const db = await openDB();
    
    // Calcular tamaño del audio (base64 a bytes aproximado)
    const size = Math.ceil((audioContent.length * 3) / 4);

    // Verificar tamaño total del caché antes de agregar
    await cleanupCacheIfNeeded(db, size);

    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const key = generateCacheKey(text, emotion, voiceName);
    const cached: CachedAudio = {
      key,
      audioContent,
      mimeType,
      timestamp: Date.now(),
      size,
    };

    const request = store.put(cached);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('[Audio Cache] Saved to cache:', key, `(${(size / 1024).toFixed(2)} KB)`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Audio Cache] Error saving to cache:', error);
  }
}

/**
 * Limpia el caché si excede el tamaño máximo
 */
async function cleanupCacheIfNeeded(db: IDBDatabase, newItemSize: number): Promise<void> {
  const transaction = db.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = async () => {
      const items = request.result as CachedAudio[];
      
      // Calcular tamaño total
      const totalSize = items.reduce((sum, item) => sum + item.size, 0);
      const maxSize = MAX_CACHE_SIZE_MB * 1024 * 1024;

      if (totalSize + newItemSize > maxSize) {
        console.log('[Audio Cache] Cache size exceeded, cleaning up...');
        
        // Ordenar por timestamp (más antiguos primero)
        items.sort((a, b) => a.timestamp - b.timestamp);

        // Eliminar items más antiguos hasta tener espacio
        const deleteTransaction = db.transaction(STORE_NAME, 'readwrite');
        const deleteStore = deleteTransaction.objectStore(STORE_NAME);
        
        let freedSpace = 0;
        let i = 0;
        
        while (freedSpace < newItemSize && i < items.length) {
          deleteStore.delete(items[i].key);
          freedSpace += items[i].size;
          console.log('[Audio Cache] Deleted old cache:', items[i].key);
          i++;
        }
      }

      resolve();
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Limpia todo el caché
 */
export async function clearAudioCache(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('[Audio Cache] Cache cleared');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Audio Cache] Error clearing cache:', error);
  }
}

/**
 * Obtiene estadísticas del caché
 */
export async function getCacheStats(): Promise<{
  count: number;
  totalSize: number;
  oldestTimestamp: number;
}> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const items = request.result as CachedAudio[];
        
        const stats = {
          count: items.length,
          totalSize: items.reduce((sum, item) => sum + item.size, 0),
          oldestTimestamp: items.length > 0 
            ? Math.min(...items.map(item => item.timestamp))
            : Date.now(),
        };

        resolve(stats);
      };

      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Audio Cache] Error getting stats:', error);
    return { count: 0, totalSize: 0, oldestTimestamp: Date.now() };
  }
}
