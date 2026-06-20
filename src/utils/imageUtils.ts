import { ImageFormat, ImageSize } from '../types';

function isBlobUrl(url: string): boolean {
  return url.startsWith('blob:');
}

async function fetchAsBlob(imageUrl: string): Promise<Blob> {
  if (isBlobUrl(imageUrl)) {
    const response = await fetch(imageUrl);
    return response.blob();
  }
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.blob();
}

export async function downloadImage(imageUrl: string, fileName: string, format: ImageFormat): Promise<void> {
  try {
    const blob = await fetchAsBlob(imageUrl);
    let finalBlob = blob;

    if (format === 'jpg') {
      const objectUrl = URL.createObjectURL(blob);
      try {
        const jpgDataUrl = await convertToJpg(objectUrl);
        const jpgResponse = await fetch(jpgDataUrl);
        finalBlob = await jpgResponse.blob();
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }

    const url = window.URL.createObjectURL(finalBlob);
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      window.URL.revokeObjectURL(url);
    }
  } catch (e) {
    console.error('Download failed:', e);
    throw new Error('图片下载失败');
  }
}

export async function convertToJpg(imageUrl: string): Promise<string> {
  const blob = await fetchAsBlob(imageUrl);
  const objectUrl = URL.createObjectURL(blob);

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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve(dataUrl);
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('图片加载失败'));
    };
    img.src = objectUrl;
  });
}

export function getPixelDimensions(size: ImageSize): { width: number; height: number } {
  const [w, h] = size.split('x').map(Number);
  return { width: w, height: h };
}
