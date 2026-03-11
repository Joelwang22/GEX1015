import { useEffect, useMemo, useState } from 'react';
import { db } from '../db';
import type { Attempt, Question, Test, Topic } from '../models';
import {
  calculateOverallAccuracy,
  calculateOverallWindows,
  calculateTopicAccuracy,
  findWeakTopics,
  type OverallAccuracy,
  type OverallWindows,
  type TopicAccuracy,
} from '../logic/analytics';

const timelinePadding = 20;

const Analytics = (): JSX.Element => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [overallWindow, setOverallWindow] = useState<'last' | 'seven' | 'all'>('all');

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    const [attemptRows, questionRows, topicRows, testRows] = await Promise.all([
      db.attempts.toArray(),
      db.questions.toArray(),
      db.topics.toArray(),
      db.tests.toArray(),
    ]);
    setAttempts(attemptRows);
    setQuestions(questionRows);
    setTopics(topicRows);
    setTests(testRows);
  };

  const overall = useMemo(() => calculateOverallAccuracy(attempts), [attempts]);

  const topicAccuracies = useMemo(() => calculateTopicAccuracy(attempts, questions), [attempts, questions]);
  const weakTopics = useMemo(() => findWeakTopics(topicAccuracies, 10), [topicAccuracies]);

  const topicNameMap = useMemo(() => new Map(topics.map((topic) => [topic.id, topic.name])), [topics]);

  const testsCompleted = useMemo(
    () =>
      tests
        .filter((test) => test.status === 'completed')
        .sort((a, b) => new Date(a.completedAt ?? a.createdAt).getTime() - new Date(b.completedAt ?? b.createdAt).getTime()),
    [tests],
  );

  const overallWindows = useMemo(() => calculateOverallWindows(attempts, testsCompleted, 7), [attempts, testsCompleted]);
  const windowsForChart = useMemo(
    () => ({
      lastTest: overallWindows.lastTest,
      sevenDays: overallWindows.sevenDays,
      allTime: overallWindows.allTime,
    }),
    [overallWindows],
  );

  const selectedOverallAccuracy =
    overallWindow === 'last'
      ? windowsForChart.lastTest
      : overallWindow === 'seven'
      ? windowsForChart.sevenDays
      : windowsForChart.allTime;

  const timelineData = useMemo(() => buildTimelineData(testsCompleted), [testsCompleted]);

  const csvContent = useMemo(() => createTopicCsv(topicAccuracies, topicNameMap), [topicAccuracies, topicNameMap]);

  const handleDownloadCsv = (): void => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `topic-accuracy-${new Date().toISOString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Analytics</h1>
        <p className="text-sm text-slate-300">
          Track accuracy trends, identify weak topics, and review your test history. Data updates automatically as you
          complete quizzes.
        </p>
      </header>

      <article className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Overall accuracy</h2>
            <p className="text-sm text-slate-400">
              Compare your performance across the latest test, rolling 7-day window, and all-time history.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <WindowOption label="Last test" value="last" current={overallWindow} onChange={setOverallWindow} />
            <WindowOption label="7 days" value="seven" current={overallWindow} onChange={setOverallWindow} />
            <WindowOption label="All time" value="all" current={overallWindow} onChange={setOverallWindow} />
          </div>
        </header>
        <AccuracyBarChart windows={windowsForChart} selected={overallWindow} />
        <p className="text-sm text-slate-300" aria-live="polite">
          Selected window accuracy: {(selectedOverallAccuracy.accuracy * 100).toFixed(1)}% across{' '}
          {selectedOverallAccuracy.totalAttempts} attempts.
        </p>
      </article>

      <article className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Per-topic accuracy</h2>
            <p className="text-sm text-slate-400">
              Sort topics by accuracy and focus on the weakest areas (highlighted below). Export to CSV for deeper review.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md border border-slate-700 px-3 py-1 text-sm hover:bg-slate-800"
            onClick={handleDownloadCsv}
          >
            Export CSV
          </button>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Topic</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Attempts</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Correct</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {topicAccuracies
                .slice()
                .sort((a, b) => b.attempts - a.attempts)
                .map((topic) => {
                  const isWeak = weakTopics.some((weak) => weak.topicId === topic.topicId);
                  const name = topicNameMap.get(topic.topicId) ?? topic.topicId;
                  return (
                    <tr key={topic.topicId} className={isWeak ? 'bg-amber-500/10' : undefined}>
                      <td className="px-3 py-2 text-sm text-slate-200">{name}</td>
                      <td className="px-3 py-2 text-sm text-slate-200">{topic.attempts}</td>
                      <td className="px-3 py-2 text-sm text-slate-200">{topic.correct}</td>
                      <td className="px-3 py-2 text-sm text-slate-200">{(topic.accuracy * 100).toFixed(1)}%</td>
                    </tr>
                  );
                })}
              {topicAccuracies.length === 0 ? (
                <tr>
                  <td className="px-3 py-4 text-center text-sm text-slate-400" colSpan={4}>
                    No attempts recorded yet. Complete a test to unlock topic analytics.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {weakTopics.length > 0 ? (
          <p className="text-sm text-amber-300">
            Focus suggestion: {weakTopics.map((topic) => topicNameMap.get(topic.topicId) ?? topic.topicId).join(', ')}
          </p>
        ) : (
          <p className="text-sm text-slate-400">Great work—no weak topics with at least 10 attempts.</p>
        )}
      </article>

      <article className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold">Test history timeline</h2>
          <p className="text-sm text-slate-400">
            Each point represents a completed test, plotted by score. Hover with your screen reader for detailed statistics.
          </p>
        </header>
        <TimelineChart data={timelineData} />
        <ul className="list-disc pl-5 text-sm text-slate-300">
          {timelineData.map((item) => (
            <li key={item.id}>
              {item.label}: {item.score}% (types: {item.types.join(', ') || '—'})
            </li>
          ))}
          {timelineData.length === 0 ? <li>No completed tests yet.</li> : null}
        </ul>
      </article>

      <aside className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
        <p>
          Overall accuracy: {(overall.accuracy * 100).toFixed(1)}% ({overall.correct}/{overall.totalAttempts} attempts). Data is
          calculated offline; clear storage from Settings to reset analytics.
        </p>
      </aside>
    </section>
  );
};

interface WindowOptionProps {
  label: string;
  value: 'last' | 'seven' | 'all';
  current: 'last' | 'seven' | 'all';
  onChange: (value: 'last' | 'seven' | 'all') => void;
}

const WindowOption = ({ label, value, current, onChange }: WindowOptionProps): JSX.Element => (
  <button
    type="button"
    className={`rounded-md px-3 py-1 ${current === value ? 'bg-primary text-white' : 'border border-slate-700 text-slate-300 hover:bg-slate-800'}`}
    onClick={() => onChange(value)}
  >
    {label}
  </button>
);

interface AccuracyBarChartProps {
  windows: {
    lastTest: OverallAccuracy;
    sevenDays: OverallAccuracy;
    allTime: OverallAccuracy;
  };
  selected: 'last' | 'seven' | 'all';
}

const AccuracyBarChart = ({ windows, selected }: AccuracyBarChartProps): JSX.Element => {
  const bars: Array<{ label: string; key: keyof OverallWindows; stat: OverallAccuracy }> = [
    { label: 'Last test', key: 'lastTest', stat: windows.lastTest },
    { label: '7 days', key: 'sevenDays', stat: windows.sevenDays },
    { label: 'All time', key: 'allTime', stat: windows.allTime },
  ];

  return (
    <svg role="img" aria-labelledby="overall-accuracy-chart" viewBox="0 0 320 160" className="w-full max-w-2xl">
      <title id="overall-accuracy-chart">Overall accuracy by window</title>
      {bars.map((bar, index) => {
        const height = Math.round((bar.stat.accuracy || 0) * 120);
        const x = 40 + index * 90;
        const y = 140 - height;
        const isSelected =
          (selected === 'last' && bar.key === 'lastTest') ||
          (selected === 'seven' && bar.key === 'sevenDays') ||
          (selected === 'all' && bar.key === 'allTime');
        return (
          <g key={bar.key}>
            <rect
              x={x}
              y={y}
              width={60}
              height={height}
              fill={isSelected ? '#0f766e' : '#1e293b'}
              stroke="#0f172a"
              aria-label={`${bar.label}: ${(bar.stat.accuracy * 100).toFixed(1)} percent accuracy`}
            />
            <text x={x + 30} y={150} textAnchor="middle" fill="#cbd5f5" fontSize="12">
              {bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

interface TimelinePoint {
  id: string;
  label: string;
  score: number;
  types: string[];
  date: Date;
}

interface TimelineChartProps {
  data: TimelinePoint[];
}

const TimelineChart = ({ data }: TimelineChartProps): JSX.Element => {
  const height = 180;
  const width = 600;

  if (data.length === 0) {
    return <p className="text-sm text-slate-400">No timeline data available yet.</p>;
  }

  const maxX = width - timelinePadding * 2;
  const maxY = height - timelinePadding * 2;

  const points = data.map((item, index) => {
    const x = timelinePadding + (data.length === 1 ? maxX / 2 : (maxX / (data.length - 1)) * index);
    const y = timelinePadding + maxY - (item.score / 100) * maxY;
    return { ...item, x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`)
    .join(' ');

  return (
    <svg role="img" aria-labelledby="timeline-chart" viewBox={`0 0 ${width} ${height}`} className="w-full max-w-3xl">
      <title id="timeline-chart">Completed test scores over time</title>
      <rect x={0} y={0} width={width} height={height} fill="#0f172a" rx={8} />
      <path d={path} fill="none" stroke="#0f766e" strokeWidth={2} />
      {points.map((point) => (
        <g key={point.id}>
          <circle cx={point.x} cy={point.y} r={5} fill="#f59e0b" aria-label={`${point.label}: ${point.score}%`} />
          <text x={point.x} y={point.y - 10} textAnchor="middle" fill="#e2e8f0" fontSize="10">
            {point.score}%
          </text>
        </g>
      ))}
    </svg>
  );
};

const buildTimelineData = (tests: Test[]): TimelinePoint[] =>
  tests.map((test) => {
    const when = new Date(test.completedAt ?? test.createdAt);
    return {
      id: test.id,
      label: when.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }),
      score: typeof test.score === 'number' ? test.score : 0,
      types: Array.from(new Set(test.selectionPolicy.types)).map((value) => value.replace(/_/g, ' ')),
      date: when,
    };
  });

const createTopicCsv = (topics: TopicAccuracy[], topicMap: Map<string, string>): string => {
  const header = 'topic,attempts,correct,accuracy\n';
  const rows = topics
    .map((topic) => {
      const name = topicMap.get(topic.topicId) ?? topic.topicId;
      return `${escapeCsv(name)},${topic.attempts},${topic.correct},${(topic.accuracy * 100).toFixed(1)}`;
    })
    .join('\n');
  return header + rows;
};

const escapeCsv = (value: string): string => {
  if (value.includes(',') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export default Analytics;
