/**
 * Storage Provider Interface
 * 
 * Defines the contract for uploading, retrieving, and deleting files.
 * This abstraction allows us to easily swap out the underlying storage mechanism
 * (e.g., Local File System, AWS S3, Cloudinary, Vercel Blob) by simply implementing
 * this interface and changing the provider via environment variables.
 */
export interface StorageProvider {
  /**
   * Uploads a file buffer and returns the public URL.
   */
  uploadFile(file: Buffer, fileName: string, contentType: string, folder?: string): Promise<string>;
  
  /**
   * Deletes a file given its URL or internal reference path.
   */
  deleteFile(fileUrl: string): Promise<boolean>;
  
  /**
   * Gets a signed URL or public URL for a given internal path.
   * Useful for private buckets or temporary access.
   */
  getFileUrl(path: string): Promise<string>;
}

/**
 * Dummy/Local Storage Provider
 * 
 * Currently just returns the existing URLs since we are relying on seed data URLs
 * for this phase. In production, this would be replaced with a Cloudinary or S3 implementation.
 */
export class DummyStorageProvider implements StorageProvider {
  async uploadFile(_file: Buffer, fileName: string, _contentType: string, folder: string = "uploads"): Promise<string> {
    // In a real local provider, this would write to /public/uploads
    console.log(`[Storage] Uploaded ${fileName} to ${folder}`);
    return `/${folder}/${fileName}`;
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    console.log(`[Storage] Deleted ${fileUrl}`);
    return true;
  }

  async getFileUrl(path: string): Promise<string> {
    return path;
  }
}

export const STORAGE_PROVIDER_TYPE = process.env.STORAGE_PROVIDER ?? "local";

// Export a singleton instance based on environment configuration
export const storage = new DummyStorageProvider();
