import type { FC } from 'react';

export interface TimerDisplayProps {
  remainingMs: number;
}

const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const TimerDisplay: FC<TimerDisplayProps> = ({ remainingMs }) => {
  return (
    <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-center">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Time Remaining</h2>
      <p className="text-2xl font-mono text-accent">{formatTime(remainingMs)}</p>
      <p className="text-xs text-slate-500">TODO: Hook into store timer controls with pause/resume.</p>
    </div>
  );
};

export default TimerDisplay;
