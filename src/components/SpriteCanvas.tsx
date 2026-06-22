import { useRef, useEffect, useState } from 'react';
import type { GridConfig } from '../types';
import { cn } from '../lib/utils';

interface SpriteCanvasProps {
  imageUrl: string | null;
  gridConfig: GridConfig;
  onEraser?: (x: number, y: number, size: number) => void;
  eraserActive?: boolean;
  eraserSize?: number;
  className?: string;
}

export function SpriteCanvas({
  imageUrl,
  gridConfig,
  onEraser,
  eraserActive,
  eraserSize = 10,
  className,
}: SpriteCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerSizeRef = useRef({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const drawOverlays = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (gridConfig.showPixelGrid && gridConfig.gridSize > 0) {
      const cellW = w / gridConfig.gridSize;
      const cellH = h / gridConfig.gridSize;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= gridConfig.gridSize; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellW, 0);
        ctx.lineTo(x * cellW, h);
        ctx.stroke();
      }
      for (let y = 0; y <= gridConfig.gridSize; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellH);
        ctx.lineTo(w, y * cellH);
        ctx.stroke();
      }
    }

    if (gridConfig.showCenterLine) {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (gridConfig.alignFootBaseline) {
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.9);
      ctx.lineTo(w, h * 0.9);
      ctx.stroke();
      ctx.fillStyle = 'rgba(234, 179, 8, 0.8)';
      ctx.font = '10px monospace';
      ctx.fillText('基线', 4, h * 0.9 - 4);
    }
  };

  const drawImage = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imageUrl) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    if (containerW <= 0 || containerH <= 0) return;

    containerSizeRef.current = { width: containerW, height: containerH };

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawToCanvas = (img: HTMLImageElement) => {
      if (!canvasRef.current) return;
      const c = canvasRef.current;
      const cW = containerSizeRef.current.width;
      const cH = containerSizeRef.current.height;

      if (cW <= 0 || cH <= 0) return;

      const containerRatio = cW / cH;
      const imgRatio = img.width / img.height;

      let drawW: number, drawH: number;
      if (imgRatio > containerRatio) {
        drawW = cW * 0.8;
        drawH = drawW / imgRatio;
      } else {
        drawH = cH * 0.8;
        drawW = drawH * imgRatio;
      }

      c.width = Math.max(1, Math.floor(drawW));
      c.height = Math.max(1, Math.floor(drawH));
      setCanvasSize({ width: c.width, height: c.height });

      ctx.clearRect(0, 0, c.width, c.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, c.width, c.height);

      drawOverlays(ctx, c.width, c.height);
    };

    if (imageRef.current && imageRef.current.src === imageUrl) {
      drawToCanvas(imageRef.current);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      drawToCanvas(img);
    };
    img.src = imageUrl;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number;
    const scheduleDraw = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => drawImage());
    };

    const resizeObserver = new ResizeObserver(() => {
      scheduleDraw();
    });
    resizeObserver.observe(container);

    scheduleDraw();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, gridConfig]);

  const getCanvasCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width),
      y: Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!eraserActive || !onEraser) return;
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    onEraser(x, y, eraserSize);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !eraserActive || !onEraser) return;
    const { x, y } = getCanvasCoords(e);
    onEraser(x, y, eraserSize);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full flex items-center justify-center overflow-hidden',
        className
      )}
      style={{
        backgroundImage:
          'linear-gradient(45deg, #1a1333 25%, transparent 25%), linear-gradient(-45deg, #1a1333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1333 75%), linear-gradient(-45deg, transparent 75%, #1a1333 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
        backgroundColor: '#0f0a1e',
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="w-full h-full bg-[linear-gradient(transparent_50%,rgba(168,85,247,0.1)_50%)] bg-[length:100%_4px]" />
      </div>

      {!imageUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
          <div className="text-center">
            <p className="font-mono text-sm text-gray-400 mb-2">暂无图片</p>
            <p className="font-mono text-xs text-gray-600">
              生成精灵后即可在此编辑
            </p>
          </div>
        </div>
      )}

      {imageUrl && (
        <div
          className={cn(
            'relative',
            gridConfig.autoCenter ? 'translate-x-0 translate-y-0' : '',
            eraserActive ? 'cursor-crosshair' : 'cursor-default'
          )}
          style={{
            transform: gridConfig.autoCenter ? 'translate(0, 0)' : undefined,
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width || 512}
            height={canvasSize.height || 512}
            className="rounded-sm shadow-neon-purple animate-pulse-neon"
            style={{
              imageRendering: 'pixelated',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      )}
    </div>
  );
}
