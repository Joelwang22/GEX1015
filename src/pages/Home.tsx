import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import type { Test, UserState } from '../models';
import { GEX1015_LESSONS } from '../data/gex1015Lessons';

const Home = (): JSX.Element => {
  const navigate = useNavigate();
  const [userState, setUserState] = useState<UserState | null>(null);
  const [lastTest, setLastTest] = useState<Test | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(0);

  useEffect(() => {
    const load = async (): Promise<void> => {
      const [state, count] = await Promise.all([
        db.userState.get('singleton'),
        db.questions.count(),
      ]);
      setUserState(state ?? null);
      setQuestionCount(count);

      if (state?.lastTestId) {
        const testRecord = await db.tests.get(state.lastTestId);
        if (testRecord && testRecord.status === 'in_progress') {
          setLastTest(testRecord);
        }
      }
    };

    void load();
  }, []);

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold text-teal-300">GEX1015</h1>
        <p className="text-lg text-slate-300">Life, the Universe, and Everything</p>
        <p className="text-slate-400">
          Guided lessons and practice quizzes for GEX1015 ethics. All progress is saved locally in your browser.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400">Study Mode</p>
          <h3 className="text-lg font-semibold">Guided Lessons</h3>
          <p className="text-sm text-slate-400">
            {GEX1015_LESSONS.length} structured lessons covering weeks 2–6.
          </p>
          <button
            type="button"
            onClick={() => navigate('/lessons')}
            className="w-full"
          >
            Browse lessons
          </button>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Practice Mode</p>
          <h3 className="text-lg font-semibold">Take a Quiz</h3>
          <p className="text-sm text-slate-400">
            {questionCount} questions across all topics. Filter by week and source.
          </p>
          <button
            type="button"
            onClick={() => navigate('/quiz')}
            className="w-full"
          >
            Start quiz
          </button>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">Progress</p>
          <h3 className="text-lg font-semibold">Analytics</h3>
          <p className="text-sm text-slate-400">
            Track accuracy by topic and identify weak areas.
          </p>
          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="w-full"
          >
            View progress
          </button>
        </div>
      </div>

      {lastTest ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-amber-200">Quiz in progress</p>
            <p className="text-sm text-amber-100/70">You have an unfinished quiz.</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-md bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-500"
            onClick={() => navigate(`/test/${lastTest.id}`)}
          >
            Resume
          </button>
        </div>
      ) : null}

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
