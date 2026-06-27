// Storage Service Interface Abstraction
// Enables swapping between Firebase Storage, GCS, or Local Mock storage later without UI changes.

class FirebaseStorageDriver {
  async uploadFile(path, file, metadata = {}) {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const { storage, isInitialized } = await import('./firebaseConfig');
    
    if (!isInitialized || !storage) {
      throw new Error('Firebase client not initialized. Cannot perform Firebase Storage operations.');
    }

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, { customMetadata: metadata });
    const url = await getDownloadURL(snapshot.ref);
    return { url, path };
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

// Spark plan constraints require mock storage for local development.
// Swap to FirebaseStorageDriver when moving to production/blaze plan.
const activeDriver = new MockStorageDriver();

export const storageService = {
  uploadFile: (path, file, metadata) => activeDriver.uploadFile(path, file, metadata),
  deleteFile: (path) => activeDriver.deleteFile(path),
  getFileUrl: (path) => activeDriver.getFileUrl(path),
};
