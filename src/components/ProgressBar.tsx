import type { FC } from 'react';

export interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

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
      <p className="text-xs text-slate-500">TODO: Integrate with test runner and mark-for-review states.</p>
    </div>
  );
};

export default ProgressBar;
