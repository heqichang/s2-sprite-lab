import type { EditConfig, BackgroundConfig } from '../types';

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = url;
  });
}

export async function createCanvasFromImage(imageUrl: string): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('无法创建画布上下文');
  }
  ctx.drawImage(img, 0, 0);
  return { canvas, ctx };
}

export function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('无法转换为 Blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

export async function applyEditTransforms(
  imageUrl: string,
  editConfig: EditConfig
): Promise<string> {
  const img = await loadImage(imageUrl);
  const {
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    scale,
    rotation,
    flipHorizontal,
    flipVertical,
  } = editConfig;

  const srcW = img.width;
  const srcH = img.height;

  const cx = (cropX / 100) * srcW;
  const cy = (cropY / 100) * srcH;
  const cw = (cropWidth / 100) * srcW;
  const ch = (cropHeight / 100) * srcH;

  const outputW = Math.round(cw * (scale / 100));
  const outputH = Math.round(ch * (scale / 100));

  const radians = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  const canvasW = Math.round(outputW * cos + outputH * sin);
  const canvasH = Math.round(outputW * sin + outputH * cos);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, canvasW);
  canvas.height = Math.max(1, canvasH);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  ctx.drawImage(
    img,
    cx,
    cy,
    cw,
    ch,
    -outputW / 2,
    -outputH / 2,
    outputW,
    outputH
  );
  ctx.restore();

  return canvasToDataUrl(canvas);
}

export async function applyColorAdjustments(
  imageUrl: string,
  editConfig: EditConfig
): Promise<string> {
  const { canvas, ctx } = await createCanvasFromImage(imageUrl);
  const { brightness, contrast, saturation, hue } = editConfig;

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const brightnessFactor = brightness / 100;
  const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  const satFactor = saturation / 100;
  const hueRad = (hue * Math.PI) / 180;
  const cosH = Math.cos(hueRad);
  const sinH = Math.sin(hueRad);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    r = r * brightnessFactor;
    g = g * brightnessFactor;
    b = b * brightnessFactor;

    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
    r = gray + satFactor * (r - gray);
    g = gray + satFactor * (g - gray);
    b = gray + satFactor * (b - gray);

    if (hue !== 0) {
      const newR =
        r * (0.213 + cosH * 0.787 - sinH * 0.213) +
        g * (0.715 - cosH * 0.715 - sinH * 0.715) +
        b * (0.072 - cosH * 0.072 + sinH * 0.928);
      const newG =
        r * (0.213 - cosH * 0.213 + sinH * 0.143) +
        g * (0.715 + cosH * 0.285 + sinH * 0.14) +
        b * (0.072 - cosH * 0.072 - sinH * 0.283);
      const newB =
        r * (0.213 - cosH * 0.213 - sinH * 0.787) +
        g * (0.715 - cosH * 0.715 + sinH * 0.715) +
        b * (0.072 + cosH * 0.928 + sinH * 0.072);
      r = newR;
      g = newG;
      b = newB;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToDataUrl(canvas);
}

export async function applyColorSwap(
  imageUrl: string,
  editConfig: EditConfig
): Promise<string> {
  const { colorSwap } = editConfig;
  if (!colorSwap.enabled) return imageUrl;

  const { canvas, ctx } = await createCanvasFromImage(imageUrl);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const from = hexToRgb(colorSwap.fromColor);
  const to = hexToRgb(colorSwap.toColor);
  const tolSq = colorSwap.tolerance * colorSwap.tolerance;

  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - from.r;
    const dg = data[i + 1] - from.g;
    const db = data[i + 2] - from.b;
    const distSq = dr * dr + dg * dg + db * db;

    if (distSq <= tolSq) {
      const t = colorSwap.tolerance > 0 ? 1 - distSq / tolSq : 1;
      data[i] = Math.round(data[i] + (to.r - data[i]) * t);
      data[i + 1] = Math.round(data[i + 1] + (to.g - data[i + 1]) * t);
      data[i + 2] = Math.round(data[i + 2] + (to.b - data[i + 2]) * t);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToDataUrl(canvas);
}

export async function removeBackground(
  imageUrl: string,
  threshold: number = 10
): Promise<string> {
  const { canvas, ctx } = await createCanvasFromImage(imageUrl);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const w = canvas.width;
  const h = canvas.height;

  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ];

  const bgColors = corners.map(([x, y]) => {
    const idx = (y * w + x) * 4;
    return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
  });

  const avgBg = bgColors.reduce(
    (acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b }),
    { r: 0, g: 0, b: 0 }
  );
  avgBg.r = Math.round(avgBg.r / 4);
  avgBg.g = Math.round(avgBg.g / 4);
  avgBg.b = Math.round(avgBg.b / 4);

  const tol = threshold * 3;

  for (let i = 0; i < data.length; i += 4) {
    const dr = Math.abs(data[i] - avgBg.r);
    const dg = Math.abs(data[i + 1] - avgBg.g);
    const db = Math.abs(data[i + 2] - avgBg.b);
    const dist = dr + dg + db;

    if (dist < tol) {
      data[i + 3] = 0;
    } else if (dist < tol * 2) {
      data[i + 3] = Math.round(255 * ((dist - tol) / tol));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToDataUrl(canvas);
}

export async function applyEdgeFeathering(
  imageUrl: string,
  featherAmount: number
): Promise<string> {
  if (featherAmount <= 0) return imageUrl;

  const { canvas, ctx } = await createCanvasFromImage(imageUrl);
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.getImageData(0, 0, w, h);
  const src = imageData.data;

  const dst = new Uint8ClampedArray(src);
  const radius = Math.min(featherAmount, 20);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      if (src[idx + 3] === 0 || src[idx + 3] === 255) continue;

      let count = 0;
      let alphaSum = 0;

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > radius) continue;
          const nIdx = (ny * w + nx) * 4;
          const weight = 1 - dist / radius;
          alphaSum += src[nIdx + 3] * weight;
          count += weight;
        }
      }

      if (count > 0) {
        dst[idx + 3] = Math.round(alphaSum / count);
      }
    }
  }

  const newImageData = new ImageData(dst, w, h);
  ctx.putImageData(newImageData, 0, 0);
  return canvasToDataUrl(canvas);
}

export async function applyPixelHardEdge(
  imageUrl: string,
  alphaThreshold: number = 128
): Promise<string> {
  const { canvas, ctx } = await createCanvasFromImage(imageUrl);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0 && data[i + 3] < 255) {
      data[i + 3] = data[i + 3] >= alphaThreshold ? 255 : 0;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvasToDataUrl(canvas);
}

export async function applyAllBackgroundProcessing(
  imageUrl: string,
  bgConfig: BackgroundConfig
): Promise<string> {
  let result = imageUrl;

  if (bgConfig.removeBackground) {
    result = await removeBackground(result, 15);
  }

  if (bgConfig.pixelHardEdge) {
    result = await applyPixelHardEdge(result, 100);
  }

  if (bgConfig.edgeFeathering > 0) {
    result = await applyEdgeFeathering(result, bgConfig.edgeFeathering);
  }

  return result;
}

export async function applyAllEdits(
  imageUrl: string,
  editConfig: EditConfig
): Promise<string> {
  let result = await applyEditTransforms(imageUrl, editConfig);
  result = await applyColorAdjustments(result, editConfig);
  result = await applyColorSwap(result, editConfig);
  return result;
}

export async function duplicateCurrent(
  imageUrl: string
): Promise<{ dataUrl: string; blob: Blob }> {
  const { canvas } = await createCanvasFromImage(imageUrl);
  const dataUrl = canvasToDataUrl(canvas);
  const blob = await canvasToBlob(canvas);
  return { dataUrl, blob };
}
