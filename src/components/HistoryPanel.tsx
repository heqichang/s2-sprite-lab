import { useGeneratorStore } from '../store/useGeneratorStore';
import { HistoryCard } from './HistoryCard';
import { History, Trash2 } from 'lucide-react';
import { PixelButton } from './PixelButton';

export function HistoryPanel() {
  const { records, clearRecords } = useGeneratorStore();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-neon-amber" />
          <h2 className="font-pixel text-sm text-neon-amber">最近生成记录</h2>
          <span className="px-2 py-0.5 text-[10px] font-mono rounded-sm bg-neon-amber/10 text-neon-amber border border-neon-amber/30">
            {records.length}/20
          </span>
        </div>
        {records.length > 0 && (
          <PixelButton
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={clearRecords}
          >
            清空记录
          </PixelButton>
        )}
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-game-border rounded-sm">
          <History className="w-12 h-12 text-gray-700 mb-3" />
          <p className="font-mono text-sm text-gray-500">暂无生成记录</p>
          <p className="font-mono text-xs text-gray-600 mt-1">
            生成的素材会自动保存在这里
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
          {records.map((record) => (
            <HistoryCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
