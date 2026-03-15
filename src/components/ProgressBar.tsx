import type { FC } from 'react';

export interface ProgressBarProps {
  current: number;
  total: number;
  answeredCount?: number;
  markedCount?: number;
}

const ProgressBar: FC<ProgressBarProps> = ({ current, total, answeredCount, markedCount }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const hasExtraStats =
    typeof answeredCount === 'number' ||
    typeof markedCount === 'number';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>Progress</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-accent" style={{ width: `${percentage}%` }} />
      </div>
      {hasExtraStats ? (
        <p className="text-xs text-slate-500">
          {typeof answeredCount === 'number' ? `${answeredCount} answered` : null}
          {typeof answeredCount === 'number' && typeof markedCount === 'number' ? ' | ' : null}
          {typeof markedCount === 'number' ? `${markedCount} marked` : null}
        </p>
      ) : null}
    </div>
  );
};

export default ProgressBar;
