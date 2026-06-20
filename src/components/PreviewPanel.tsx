import { useState } from 'react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { PixelButton } from './PixelButton';
import { DownloadModal } from './DownloadModal';
import {
  Download,
  Save,
  Eye,
  Image as ImageIcon,
  Wand2,
} from 'lucide-react';
import { useImageGenerator } from '../hooks/useImageGenerator';
import { ASSET_TYPE_OPTIONS, ART_STYLE_OPTIONS } from '../types';

export function PreviewPanel() {
  const {
    currentImage,
    prompt,
    type,
    style,
    size,
    isGenerating,
    addToLibrary,
  } = useGeneratorStore();

  const { generateImage } = useImageGenerator();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const typeLabel = ASSET_TYPE_OPTIONS.find((o) => o.value === type)?.label || type;
  const styleLabel = ART_STYLE_OPTIONS.find((o) => o.value === style)?.label || style;

  const handleSaveToLibrary = () => {
    if (!currentImage) return;
    addToLibrary({
      name: `${typeLabel}-${styleLabel}-${Date.now()}`,
      imageUrl: currentImage,
      type,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-neon-cyan" />
          <h2 className="font-pixel text-sm text-neon-cyan">生成预览</h2>
        </div>
        {currentImage && (
          <div className="flex items-center gap-2 font-mono text-xs text-gray-400">
            <span className="px-2 py-1 bg-game-bg rounded-sm border border-game-border">
              {typeLabel}
            </span>
            <span className="px-2 py-1 bg-game-bg rounded-sm border border-game-border">
              {styleLabel}
            </span>
            <span className="px-2 py-1 bg-game-bg rounded-sm border border-game-border">
              {size}
            </span>
          </div>
        )}
      </div>

      <div
        className="relative flex-1 min-h-[400px] rounded-sm border-2 border-game-border overflow-hidden"
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

        {isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-game-bg/80 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-neon-purple/30 border-t-neon-purple rounded-full animate-spin" />
            <p className="font-mono text-sm text-neon-purple animate-pulse">
              正在施展像素魔法...
            </p>
          </div>
        )}

        {!currentImage && !isGenerating && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="w-24 h-24 rounded-full bg-game-card border-2 border-dashed border-game-border flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-600" />
            </div>
            <div className="text-center">
              <p className="font-mono text-sm text-gray-400 mb-2">暂无预览图片</p>
              <p className="font-mono text-xs text-gray-600">
                在左侧输入描述并点击生成按钮
              </p>
            </div>
          </div>
        )}

        {currentImage && !isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <img
              src={currentImage}
              alt="Generated sprite"
              className="max-w-full max-h-full object-contain rounded-sm shadow-neon-purple animate-pulse-neon"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <PixelButton
          variant="secondary"
          size="md"
          icon={<Wand2 className="w-4 h-4" />}
          onClick={generateImage}
          disabled={isGenerating || !prompt.trim()}
        >
          重新生成
        </PixelButton>
        <PixelButton
          variant="primary"
          size="md"
          icon={<Download className="w-4 h-4" />}
          onClick={() => setShowDownloadModal(true)}
          disabled={!currentImage}
        >
          下载
        </PixelButton>
        <PixelButton
          variant="success"
          size="md"
          icon={<Save className="w-4 h-4" />}
          onClick={handleSaveToLibrary}
          disabled={!currentImage}
        >
          {saved ? '已保存!' : '保存素材'}
        </PixelButton>
      </div>

      {showDownloadModal && (
        <DownloadModal onClose={() => setShowDownloadModal(false)} />
      )}
    </div>
  );
}
