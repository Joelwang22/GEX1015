import { useEffect, useState } from 'react';
import { db, DEFAULT_MASTERY_THRESHOLD, resetDatabase } from '../db';
import type { AppConfig } from '../models';

const Settings = (): JSX.Element => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    void loadConfig();
  }, []);

  const loadConfig = async (): Promise<void> => {
    const current = await db.config.get('settings');
    if (!current) {
      await db.config.put({ id: 'settings', masteryThreshold: DEFAULT_MASTERY_THRESHOLD });
      setConfig({ id: 'settings', masteryThreshold: DEFAULT_MASTERY_THRESHOLD });
    } else {
      setConfig(current);
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!config) {
      return;
    }
    await db.config.put(config);
    setStatusMessage('Preferences saved.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleReset = async (): Promise<void> => {
    if (!confirm('This will delete all your quiz history and progress. Are you sure?')) {
      return;
    }
    setResetting(true);
    try {
      await resetDatabase();
      setStatusMessage('Database reset. All data cleared and re-seeded.');
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Reset failed.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-400">
          Preferences are stored locally in your browser (IndexedDB).
        </p>
      </header>

      <article className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-xl font-semibold">Quiz preferences</h2>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300" htmlFor="masteryThreshold">
            Mastery threshold
          </label>
          <input
            id="masteryThreshold"
            type="number"
            className="w-24 rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
            min={1}
            max={10}
            value={config?.masteryThreshold ?? DEFAULT_MASTERY_THRESHOLD}
            onChange={(event) =>
              setConfig((current) => ({
                id: 'settings',
                masteryThreshold: Math.max(1, Number(event.target.value)),
                timerEnabled: current?.timerEnabled ?? false,
              }))
            }
          />
          <p className="text-sm text-slate-400">
            Questions answered correctly this many times are considered mastered.
          </p>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-100">
            <input
              type="checkbox"
              checked={Boolean(config?.timerEnabled)}
              onChange={(event) =>
                setConfig((current) => ({
                  id: 'settings',
                  masteryThreshold: current?.masteryThreshold ?? DEFAULT_MASTERY_THRESHOLD,
                  timerEnabled: event.target.checked,
                }))
              }
            />
            Enable 30-minute countdown timer for quizzes
          </label>
        </div>
        <button
          type="button"
          className="rounded-md border border-slate-700 bg-transparent px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          onClick={handleSave}
        >
          Save preferences
        </button>
        {statusMessage ? <p className="text-sm text-green-300">{statusMessage}</p> : null}
      </article>

      <article className="space-y-4 rounded-lg border border-red-500/40 bg-red-500/10 p-4">
        <h2 className="text-xl font-semibold text-red-200">Reset database</h2>
        <p className="text-sm text-red-100">
          Deletes all quiz history, results, and progress. The question bank will be re-seeded from scratch.
          This cannot be undone.
        </p>
        <button
          type="button"
          className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-60"
          onClick={handleReset}
          disabled={resetting}
        >
          {resetting ? 'Resetting…' : 'Reset all data'}
        </button>
      </article>
    </section>
  );
};

export default Settings;
