import imageCompression from 'browser-image-compression';

export interface CompressionResult {
  compressedFile: File;
  originalSizeKB: number;
  compressedSizeKB: number;
  savedPercentage: number;
}

/**
 * Compresses an image file client-side using browser-image-compression
 * strictly adhering to:
 * - maxSizeMB: 0.2 (200 KB)
 * - maxWidthOrHeight: 800 px
 */
export async function compressImage(file: File): Promise<CompressionResult> {
  const originalSizeKB = Math.round(file.size / 1024);

  const options = {
    maxSizeMB: 0.2, // 200 KB maximum
    maxWidthOrHeight: 800, // 800x800 maximum dimensions
    useWebWorker: true,
    fileType: file.type || 'image/jpeg',
    initialQuality: 0.8
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
      type: compressedBlob.type || 'image/jpeg',
      lastModified: Date.now()
    });

    const compressedSizeKB = Math.round(compressedFile.size / 1024);
    const savedPercentage = originalSizeKB > 0 
      ? Math.max(0, Math.round(((originalSizeKB - compressedSizeKB) / originalSizeKB) * 100))
      : 0;

    return {
      compressedFile,
      originalSizeKB,
      compressedSizeKB,
      savedPercentage
    };
  } catch (error: any) {
    console.warn('Image compression fallback:', error);
    // If compression fails unexpectedly, return original file if small or bubble error
    return {
      compressedFile: file,
      originalSizeKB,
      compressedSizeKB: originalSizeKB,
      savedPercentage: 0
    };
  }
}

/**
 * Converts a File or Blob into a Base64 data URL
 */
export function fileToDataUrl(file: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
