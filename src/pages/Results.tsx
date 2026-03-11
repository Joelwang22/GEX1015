import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { db, DEFAULT_TEST_DURATION_MINUTES } from '../db';
import type { AppConfig, Question, Test } from '../models';

const Results = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const testId = (location.state as { testId?: string } | null)?.testId;
    if (!testId) {
      return;
    }

    const load = async (): Promise<void> => {
      try {
        const record = await db.tests.get(testId);
        if (!record) {
          setError('Results unavailable.');
          return;
        }
        setTest(record);
        const questionRecords = await db.questions.bulkGet(record.questionIds);
        setQuestions(
          questionRecords.filter((question): question is Question => Boolean(question)),
        );
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load results.');
      }
    };

    void load();
  }, [location.state]);

  useEffect(() => {
    const fetchConfig = async (): Promise<void> => {
      const settings = await db.config.get('settings');
      setConfig(settings ?? { id: 'settings', masteryThreshold: 3, timerEnabled: false });
    };
    void fetchConfig();
  }, []);

  const missedQuestionIds = useMemo(() => {
    if (!test) {
      return [];
    }
    return test.questionIds.filter((id) => test.answers[id]?.isCorrect === false);
  }, [test]);

  const handleRetryMissed = async (): Promise<void> => {
    if (!test || missedQuestionIds.length === 0) {
      return;
    }

    const now = new Date().toISOString();
    const newId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `retry-${Date.now()}`;
    const settings = config ?? { id: 'settings', masteryThreshold: 3, timerEnabled: false };

    const retryTest: Test = {
      id: newId,
      status: 'in_progress',
      subjectIds: test.subjectIds,
      topicIds: test.topicIds,
      selectionPolicy: test.selectionPolicy,
      questionIds: missedQuestionIds,
      currentIndex: 0,
      answers: {},
      markedForReview: [],
      timeSpentMs: 0,
      score: 0,
      createdAt: now,
      timeRemainingMs: settings.timerEnabled ? DEFAULT_TEST_DURATION_MINUTES * 60 * 1000 : undefined,
    };

    await db.tests.put(retryTest);
    const existingUserState = await db.userState.get('singleton');
    await db.userState.put({
      ...existingUserState,
      id: 'singleton',
      lastTestId: newId,
    });

    navigate(`/test/${newId}`);
  };

  if (!test) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Results</h1>
        {error ? <p className="text-red-400">{error}</p> : <p>No completed test selected.</p>}
        <Link to="/quiz" className="text-teal-300">
          Create a new quiz
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Results</h1>
          <p className="text-slate-300">
            Completed {new Date(test.completedAt ?? test.createdAt).toLocaleString()} — Score: {test.score}%
          </p>
        </div>
        {missedQuestionIds.length > 0 ? (
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-teal-600"
            onClick={handleRetryMissed}
          >
            Retry {missedQuestionIds.length} missed question{missedQuestionIds.length > 1 ? 's' : ''}
          </button>
        ) : null}
      </header>

      <table className="min-w-full divide-y divide-slate-800">
        <thead className="bg-slate-900">
          <tr>
            <th className="px-3 py-2 text-left text-sm font-semibold uppercase tracking-wide text-slate-400">
              Question
            </th>
            <th className="px-3 py-2 text-left text-sm font-semibold uppercase tracking-wide text-slate-400">
              Result
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {test.questionIds.map((questionId) => {
            const question = questions.find((item) => item.id === questionId);
            const answer = test.answers[questionId];
            return (
              <tr key={questionId}>
                <td className="px-3 py-2 text-sm text-slate-200">{question?.stem ?? 'Unknown question'}</td>
                <td className="px-3 py-2 text-sm">
                  {answer?.isCorrect ? (
                    <span className="text-emerald-400">Correct</span>
                  ) : (
                    <span className="text-red-400">Review</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Link
        to="/analytics"
        className="inline-flex w-fit items-center rounded-md border border-slate-700 px-4 py-2 text-teal-200 hover:bg-slate-800"
      >
        View analytics
      </Link>
    </section>
  );
};

export default Results;
