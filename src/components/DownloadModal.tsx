import { useState } from 'react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { PixelButton } from './PixelButton';
import { ImageFormat } from '../types';
import { downloadImage, convertToJpg } from '../utils/imageUtils';
import { X, Download, FileImage, FileImage as JpgIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface DownloadModalProps {
  onClose: () => void;
}

export function DownloadModal({ onClose }: DownloadModalProps) {
  const { currentImage, type, style } = useGeneratorStore();
  const [format, setFormat] = useState<ImageFormat>('png');
  const [fileName, setFileName] = useState(
    `sprite-${type}-${style}-${Date.now()}`
  );
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!currentImage || !fileName.trim()) return;

    setIsDownloading(true);
    try {
      let imageUrl = currentImage;
      if (format === 'jpg') {
        imageUrl = await convertToJpg(currentImage);
      }
      await downloadImage(imageUrl, fileName.trim(), format);
      onClose();
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-game-card border-2 border-neon-purple rounded-sm shadow-neon-purple"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b-2 border-game-border">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-neon-purple" />
            <h3 className="font-pixel text-sm text-neon-purple">下载图片</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-sm text-gray-400 hover:text-white hover:bg-game-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
              文件名称
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className={cn(
                'w-full p-3 rounded-sm',
                'bg-game-bg border-2 border-game-border',
                'font-mono text-sm text-white',
                'focus:outline-none focus:border-neon-purple transition-colors'
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
              图片格式
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('png')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-sm border-2 transition-all duration-200',
                  format === 'png'
                    ? 'bg-neon-purple/20 border-neon-purple text-neon-purple shadow-neon-purple'
                    : 'bg-game-bg border-game-border text-gray-400 hover:border-neon-purple/50 hover:text-neon-purple/70'
                )}
              >
                <FileImage className="w-8 h-8" />
                <span className="font-mono text-sm">PNG</span>
                <span className="font-mono text-xs opacity-70">支持透明</span>
              </button>
              <button
                onClick={() => setFormat('jpg')}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-sm border-2 transition-all duration-200',
                  format === 'jpg'
                    ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-neon-cyan'
                    : 'bg-game-bg border-game-border text-gray-400 hover:border-neon-cyan/50 hover:text-neon-cyan/70'
                )}
              >
                <JpgIcon className="w-8 h-8" />
                <span className="font-mono text-sm">JPG</span>
                <span className="font-mono text-xs opacity-70">文件更小</span>
              </button>
            </div>
          </div>

          {currentImage && (
            <div className="p-3 bg-game-bg rounded-sm border border-game-border">
              <img
                src={currentImage}
                alt="Preview"
                className="w-full h-32 object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 p-4 border-t-2 border-game-border">
          <PixelButton
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
          >
            取消
          </PixelButton>
          <PixelButton
            variant="primary"
            size="md"
            className="flex-1"
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
            disabled={isDownloading || !fileName.trim()}
          >
            {isDownloading ? '下载中...' : '下载'}
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
