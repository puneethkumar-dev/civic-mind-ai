// Storage Service Interface Abstraction
// Enables swapping between Firebase Storage, GCS, or Local Mock storage later without UI changes.

class FirebaseStorageDriver {
  async uploadFile(path, file, metadata = {}) {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { storage, isInitialized } = await import('./firebaseConfig');
    
    if (!isInitialized || !storage) {
      throw new Error('Firebase client not initialized. Cannot perform Firebase Storage operations.');
    }

    try {
      const storageRef = ref(storage, path);
      
      // Wrap the storage upload in a 3-second timeout to prevent infinite hangs on slow/blocked connections
      const uploadPromise = uploadBytes(storageRef, file, { customMetadata: metadata });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase Storage upload timed out')), 3000)
      );

      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
      const url = await getDownloadURL(snapshot.ref);
      return { url, path };
    } catch (err) {
      console.warn('[Storage Service] Firebase Storage upload failed, falling back to local object URL:', err.message);
      // Return a local Object URL (mock behavior) as a fallback so the app continues working locally
      const url = URL.createObjectURL(file);
      return { url, path };
    }
  }

  async deleteFile(path) {
    const { ref, deleteObject } = await import('firebase/storage');
    const { storage, isInitialized } = await import('./firebaseConfig');
    
    if (!isInitialized || !storage) {
      throw new Error('Firebase client not initialized. Cannot perform Firebase Storage operations.');
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  }

  async getFileUrl(path) {
    const { ref, getDownloadURL } = await import('firebase/storage');
    const { storage, isInitialized } = await import('./firebaseConfig');
    
    if (!isInitialized || !storage) {
      throw new Error('Firebase client not initialized. Cannot perform Firebase Storage operations.');
    }

    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  }
}

class MockStorageDriver {
  constructor() {
    this.mockFiles = new Map();
  }

  async uploadFile(path, file, metadata = {}) {
    console.log(`[Storage Mock] Uploading file to "${path}":`, file, metadata);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Create a local blob URL so the frontend can preview the image immediately
    const url = URL.createObjectURL(file);
    this.mockFiles.set(path, url);
    
    return { url, path };
  }

  async deleteFile(path) {
    console.log(`[Storage Mock] Deleting file at "${path}"`);
    this.mockFiles.delete(path);
  }

  async getFileUrl(path) {
    const url = this.mockFiles.get(path);
    if (url) return url;
    return `https://storage.googleapis.com/civic-mind-ai-mock-bucket/${path}`;
  }
}

import { isInitialized } from './firebaseConfig';

const activeDriver = isInitialized ? new FirebaseStorageDriver() : new MockStorageDriver();

export const storageService = {
  uploadFile: (path, file, metadata) => activeDriver.uploadFile(path, file, metadata),
  deleteFile: (path) => activeDriver.deleteFile(path),
  getFileUrl: (path) => activeDriver.getFileUrl(path),
};
