import { ImageFormat, ImageSize } from '../types';

function isBlobUrl(url: string): boolean {
  return url.startsWith('blob:');
}

function remoteToProxy(url: string): string {
  try {
    const u = new URL(url);
    if (u.pathname.includes('/text_to_image')) {
      return `/api/text-to-image${u.search}`;
    }
  } catch {}
  return url;
}

export async function downloadImage(
  imageUrl: string,
  fileName: string,
  format: ImageFormat
): Promise<void> {
  try {
    let blob: Blob;

    if (isBlobUrl(imageUrl)) {
      const res = await fetch(imageUrl);
      blob = await res.blob();
    } else {
      const fetchUrl = imageUrl.startsWith('http') ? remoteToProxy(imageUrl) : imageUrl;
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      blob = await res.blob();
      if (blob.size === 0) throw new Error('Empty response');
    }

    if (format === 'jpg') {
      const objUrl = URL.createObjectURL(blob);
      try {
        const jpgDataUrl = await convertToJpg(objUrl);
        const jpgBlob = await (await fetch(jpgDataUrl)).blob();
        await triggerDownload(jpgBlob, `${fileName}.jpg`);
      } finally {
        URL.revokeObjectURL(objUrl);
      }
    } else {
      await triggerDownload(blob, `${fileName}.png`);
    }
  } catch (e) {
    console.warn('Download via fetch failed, fallback to new tab:', e);
    window.open(imageUrl, '_blank');
  }
}

async function triggerDownload(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function convertToJpg(imageUrl: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = imageUrl;
  });
}

export function getPixelDimensions(size: ImageSize): { width: number; height: number } {
  const [w, h] = size.split('x').map(Number);
  return { width: w, height: h };
}

export async function resizeImage(
  blob: Blob,
  targetWidth: number,
  targetHeight: number,
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob(
          (resultBlob) => {
            URL.revokeObjectURL(url);
            if (resultBlob) {
              resolve(resultBlob);
            } else {
              reject(new Error('Failed to convert canvas to blob'));
            }
          },
          'image/png',
          1.0
        );
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };
    img.src = url;
  });
}

export function getClosestSupportedSize(
  targetWidth: number,
  targetHeight: number,
  supportedSizes: Array<{ w: number; h: number; label?: string }>,
): { w: number; h: number } {
  const targetPixels = targetWidth * targetHeight;
  const targetRatio = targetWidth / targetHeight;

  let bestMatch = supportedSizes[0];
  let bestScore = Infinity;

  for (const size of supportedSizes) {
    const sizePixels = size.w * size.h;
    const sizeRatio = size.w / size.h;

    const pixelDiff = Math.abs(Math.log(sizePixels) - Math.log(Math.max(targetPixels, 512 * 512)));
    const ratioDiff = Math.abs(Math.log(sizeRatio) - Math.log(targetRatio));
    const score = pixelDiff * 2 + ratioDiff * 3;

    if (score < bestScore) {
      bestScore = score;
      bestMatch = size;
    }
  }

  return bestMatch;
}
