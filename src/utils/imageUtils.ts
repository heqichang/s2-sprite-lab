import { ImageFormat, ImageSize } from '../types';

export async function downloadImage(imageUrl: string, fileName: string, format: ImageFormat): Promise<void> {
  try {
    const blob = await fetchImageAsBlob(imageUrl);

    if (format === 'jpg') {
      const objectUrl = URL.createObjectURL(blob);
      try {
        const jpgDataUrl = await convertToJpg(objectUrl);
        const jpgBlob = await (await fetch(jpgDataUrl)).blob();
        await triggerDownload(jpgBlob, `${fileName}.jpg`);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } else {
      await triggerDownload(blob, `${fileName}.png`);
    }
  } catch {
    window.open(imageUrl, '_blank');
  }
}

async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const blob = await response.blob();
  if (blob.size === 0 || !blob.type.startsWith('image/')) {
    throw new Error('Invalid image response');
  }
  return blob;
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
