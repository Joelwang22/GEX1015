import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import type { Test, UserState } from '../models';

const Home = (): JSX.Element => {
  const navigate = useNavigate();
  const [userState, setUserState] = useState<UserState | null>(null);
  const [lastTest, setLastTest] = useState<Test | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const state = await db.userState.get('singleton');
        setUserState(state ?? null);

        if (state?.lastTestId) {
          const testRecord = await db.tests.get(state.lastTestId);
          if (testRecord && testRecord.status === 'in_progress') {
            setLastTest(testRecord);
          }
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load dashboard.');
      }
    };

    void load();
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Cybersec Quiz</h1>
        <p className="text-slate-300">
          Offline-first Security+ practice. Build custom tests, review guided lessons, focus on weak
          topics, and track progress over time.
        </p>
      </header>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          className="rounded-md border border-slate-700 px-4 py-2 text-teal-200 hover:bg-slate-800"
          onClick={() => navigate('/lessons')}
        >
          Guided lessons
        </button>
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-teal-600"
          onClick={() => navigate('/create-test')}
        >
          Create new test
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-700 px-4 py-2 text-teal-200 hover:bg-slate-800"
          onClick={() => navigate('/acronyms')}
        >
          Acronym list
        </button>
        <button
          type="button"
          className="rounded-md border border-slate-700 px-4 py-2 text-teal-200 hover:bg-slate-800"
          onClick={() => navigate('/hangman')}
        >
          Acronym hangman
        </button>
        {lastTest ? (
          <button
            type="button"
            className="rounded-md border border-slate-700 px-4 py-2 text-teal-200 hover:bg-slate-800"
            onClick={() => navigate(`/test/${lastTest.id}`)}
          >
            Resume last test
          </button>
        ) : null}
      </div>

      <section className="space-y-2 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-xl font-semibold">Next steps</h2>
        <ul className="list-disc space-y-1 pl-5 text-slate-300">
          <li>Refine PBQ interactions with accessible drag-and-drop alternatives.</li>
          <li>Extend analytics dashboard with recent streaks and per-topic mastery.</li>
          <li>Implement import/export flows for sharing question banks.</li>
        </ul>
      </section>

      {userState?.bestScores ? (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Best scores</h2>
          <ul className="space-y-1 text-slate-300">
            {Object.entries(userState.bestScores).map(([subjectId, score]) => (
              <li key={subjectId}>
                {subjectId}: {score}%
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </section>
  );
};

export default Home;
