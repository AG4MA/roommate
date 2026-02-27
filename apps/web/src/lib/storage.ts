import { put, del, list } from '@vercel/blob';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

// ─── Configuration ───────────────────────────────────────────────

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (original, before compression)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const IMAGE_SIZES = {
  thumbnail: { width: 400, height: 300, quality: 75 },
  medium:    { width: 800, height: 600, quality: 80 },
  full:      { width: 1600, height: 1200, quality: 85 },
} as const;

type ImageSize = keyof typeof IMAGE_SIZES;

const isCloudEnabled = (): boolean => !!process.env.BLOB_READ_WRITE_TOKEN;

// ─── Image Processing ────────────────────────────────────────────

async function processImage(
  buffer: Buffer,
  size: ImageSize,
): Promise<Buffer> {
  const config = IMAGE_SIZES[size];
  return sharp(buffer)
    .resize(config.width, config.height, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: config.quality })
    .toBuffer();
}

// ─── Upload Functions ────────────────────────────────────────────

export interface UploadResult {
  url: string;
  thumbnailUrl: string;
  filename: string;
}

/**
 * Upload an image file. In production (BLOB_READ_WRITE_TOKEN set), uploads
 * to Vercel Blob. Otherwise, falls back to local public/uploads/.
 * 
 * Always generates a full-size optimized version + thumbnail.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError(
      'Tipo file non consentito. Usa JPEG, PNG, WebP o AVIF.',
      400
    );
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    throw new UploadError(
      'File troppo grande. Massimo 10MB.',
      400
    );
  }

  const bytes = await file.arrayBuffer();
  const originalBuffer = Buffer.from(bytes);

  // Process images in parallel
  const [fullBuffer, thumbBuffer] = await Promise.all([
    processImage(originalBuffer, 'full'),
    processImage(originalBuffer, 'thumbnail'),
  ]);

  const id = randomUUID();

  if (isCloudEnabled()) {
    return uploadToCloud(id, fullBuffer, thumbBuffer);
  } else {
    return uploadToLocal(id, fullBuffer, thumbBuffer);
  }
}

async function uploadToCloud(
  id: string,
  fullBuffer: Buffer,
  thumbBuffer: Buffer,
): Promise<UploadResult> {
  const [fullBlob, thumbBlob] = await Promise.all([
    put(`listings/${id}.webp`, fullBuffer, {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: false,
    }),
    put(`listings/${id}-thumb.webp`, thumbBuffer, {
      access: 'public',
      contentType: 'image/webp',
      addRandomSuffix: false,
    }),
  ]);

  return {
    url: fullBlob.url,
    thumbnailUrl: thumbBlob.url,
    filename: `${id}.webp`,
  };
}

async function uploadToLocal(
  id: string,
  fullBuffer: Buffer,
  thumbBuffer: Buffer,
): Promise<UploadResult> {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const fullFilename = `${id}.webp`;
  const thumbFilename = `${id}-thumb.webp`;

  await Promise.all([
    writeFile(join(UPLOAD_DIR, fullFilename), fullBuffer),
    writeFile(join(UPLOAD_DIR, thumbFilename), thumbBuffer),
  ]);

  return {
    url: `/uploads/${fullFilename}`,
    thumbnailUrl: `/uploads/${thumbFilename}`,
    filename: fullFilename,
  };
}

// ─── Delete Functions ────────────────────────────────────────────

/**
 * Delete an image and its thumbnail by URL.
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    if (isCloudEnabled()) {
      // Derive thumbnail URL from full URL
      const thumbUrl = url.replace('.webp', '-thumb.webp');
      await Promise.all([
        del(url),
        del(thumbUrl),
      ]);
    } else {
      // Local delete
      const filename = url.split('/').pop();
      if (filename) {
        const thumbFilename = filename.replace('.webp', '-thumb.webp');
        await Promise.all([
          unlink(join(UPLOAD_DIR, filename)).catch(() => {}),
          unlink(join(UPLOAD_DIR, thumbFilename)).catch(() => {}),
        ]);
      }
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw — deletion failures shouldn't block operations
  }
}

/**
 * Delete multiple images by URLs.
 */
export async function deleteImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map(deleteImage));
}

// ─── Cleanup Functions ───────────────────────────────────────────

/**
 * List all stored images (cloud only). Useful for orphan cleanup.
 */
export async function listStoredImages(): Promise<string[]> {
  if (!isCloudEnabled()) {
    console.warn('listStoredImages() only works with cloud storage');
    return [];
  }

  const result = await list({ prefix: 'listings/' });
  return result.blobs.map(blob => blob.url);
}

// ─── Error Class ─────────────────────────────────────────────────

export class UploadError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'UploadError';
    this.status = status;
  }
}
