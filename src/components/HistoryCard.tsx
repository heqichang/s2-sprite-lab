import { useState } from 'react';
import { GenerationRecord, ASSET_TYPE_OPTIONS, ART_STYLE_OPTIONS } from '../types';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { useImageGenerator } from '../hooks/useImageGenerator';
import {
  RefreshCw,
  Copy,
  Trash2,
  Check,
} from 'lucide-react';

interface HistoryCardProps {
  record: GenerationRecord;
}

export function HistoryCard({ record }: HistoryCardProps) {
  const { deleteRecord, setCurrentImage } = useGeneratorStore();
  const { regenerateImage } = useImageGenerator();
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const typeLabel = ASSET_TYPE_OPTIONS.find((o) => o.value === record.type)?.label || record.type;
  const styleLabel = ART_STYLE_OPTIONS.find((o) => o.value === record.style)?.label || record.style;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(record.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await regenerateImage(record.prompt, record.type, record.style, record.size);
    setIsRegenerating(false);
  };

  const handlePreview = () => {
    setCurrentImage(record.imageUrl);
  };

  return (
    <div className="flex-shrink-0 w-48 group">
      <div
        className="relative rounded-sm border-2 border-game-border overflow-hidden cursor-pointer transition-all duration-200 hover:border-neon-purple hover:shadow-neon-purple bg-game-card"
        onClick={handlePreview}
      >
        <div
          className="w-full h-36 overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(45deg, #1a1333 25%, transparent 25%), linear-gradient(-45deg, #1a1333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1333 75%), linear-gradient(-45deg, transparent 75%, #1a1333 75%)',
            backgroundSize: '10px 10px',
            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
          }}
        >
          <img
            src={record.imageUrl}
            alt={record.prompt}
            className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRegenerate();
            }}
            disabled={isRegenerating}
            className="p-1.5 rounded-sm bg-game-bg/90 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20 transition-colors"
            title="重新生成"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopyPrompt();
            }}
            className="p-1.5 rounded-sm bg-game-bg/90 border border-neon-amber text-neon-amber hover:bg-neon-amber/20 transition-colors"
            title="复制提示词"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteRecord(record.id);
            }}
            className="p-1.5 rounded-sm bg-game-bg/90 border border-red-500 text-red-400 hover:bg-red-500/20 transition-colors"
            title="删除记录"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="absolute top-2 right-2 flex gap-1">
          <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-sm bg-neon-purple/20 text-neon-purple border border-neon-purple/50">
            {record.size}
          </span>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        <div className="flex gap-1">
          <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-sm bg-neon-blue/10 text-neon-blue border border-neon-blue/30">
            {typeLabel}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-sm bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30">
            {styleLabel}
          </span>
        </div>
        <p className="font-mono text-xs text-gray-400 truncate" title={record.prompt}>
          {record.prompt}
        </p>
        <p className="font-mono text-[10px] text-gray-600">
          {formatDate(record.createdAt)}
        </p>
      </div>
    </div>
  );
}
