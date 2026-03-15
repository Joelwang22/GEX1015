import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, DEFAULT_TEST_DURATION_MINUTES } from '../db';
import type { AppConfig, Question, QuestionType, Subject, Test, Topic } from '../models';
import { buildTest, type TestBuilderResult } from '../logic/testBuilder';

type SourceOption = Test['selectionPolicy']['source'];

const DEFAULT_SIZE = 20;

const getTopicSortValue = (topic: Topic): { week: number; name: string } => {
  const match = topic.name.match(/week\s+(\d+)/i);
  return {
    week: match ? Number(match[1]) : Number.POSITIVE_INFINITY,
    name: topic.name,
  };
};

const sortTopicsByWeek = (topics: Topic[]): Topic[] =>
  [...topics].sort((left, right) => {
    const leftValue = getTopicSortValue(left);
    const rightValue = getTopicSortValue(right);

    if (leftValue.week !== rightValue.week) {
      return leftValue.week - rightValue.week;
    }

    return leftValue.name.localeCompare(rightValue.name);
  });

const CreateTest = (): JSX.Element => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [source, setSource] = useState<SourceOption>('all');
  const [size, setSize] = useState<number>(DEFAULT_SIZE);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [topicsOpen, setTopicsOpen] = useState<boolean>(true);

  useEffect(() => {
    const load = async (): Promise<void> => {
      await db.ensureSeedData();

      const [subjectsData, topicsData, questionsData, configData] = await Promise.all([
        db.subjects.toArray(),
        db.topics.toArray(),
        db.questions.toArray(),
        db.config.get('settings'),
      ]);

      setSubjects(subjectsData);
      setTopics(sortTopicsByWeek(topicsData));
      setQuestions(questionsData);
      setConfig(configData ?? { id: 'settings', masteryThreshold: 3, timerEnabled: false });
    };

    void load();
  }, []);

  const topicsSummary = useMemo(() => {
    if (selectedTopicIds.length === 0) {
      return 'All topics included.';
    }
    const count = selectedTopicIds.length;
    return `${count} topic${count === 1 ? '' : 's'} selected.`;
  }, [selectedTopicIds.length]);

  const handleToggleTopic = (topicId: string): void => {
    setSelectedTopicIds((current) => {
      if (current.includes(topicId)) {
        return current.filter((id) => id !== topicId);
      }
      return [...current, topicId];
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const attempts = await db.attempts.toArray();
      const subjectIds = subjects.map((s) => s.id);
      const availableTypes: QuestionType[] = Array.from(new Set(questions.map((q) => q.type)));

      const desiredSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : DEFAULT_SIZE;

      const builderResult: TestBuilderResult = buildTest({
        questions,
        attempts,
        subjectIds,
        topicIds: selectedTopicIds,
        selectionPolicy: {
          source,
          types: availableTypes,
        },
        size: desiredSize,
        masteryThreshold: config?.masteryThreshold,
      });

      setDiagnostics(builderResult.diagnostics);

      if (builderResult.questionIds.length === 0) {
        setError(builderResult.diagnostics[0] ?? 'Unable to build test with current filters.');
        return;
      }

      const createdAt = new Date().toISOString();
      const testId = crypto.randomUUID();

      await db.transaction('rw', db.tests, db.userState, async () => {
        const testRecord: Test = {
          id: testId,
          status: 'in_progress',
          subjectIds,
          topicIds: selectedTopicIds,
          selectionPolicy: {
            source,
            types: availableTypes,
          },
          questionIds: builderResult.questionIds,
          currentIndex: 0,
          answers: {},
          markedForReview: [],
          timeSpentMs: 0,
          score: 0,
          createdAt,
          timeRemainingMs: config?.timerEnabled
            ? DEFAULT_TEST_DURATION_MINUTES * 60 * 1000
            : undefined,
        };

        await db.tests.put(testRecord);

        const existingUserState = await db.userState.get('singleton');
        await db.userState.put({
          ...existingUserState,
          id: 'singleton',
          lastTestId: testId,
        });
      });

      navigate(`/test/${testId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Create Quiz</h1>
        <p className="text-slate-300">
          Choose topics and a question source to build a custom quiz.
        </p>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Topics</h2>
              <p className="text-sm text-slate-400">{topicsSummary}</p>
            </div>
            <button
              type="button"
              className="rounded-md border border-slate-700 bg-transparent px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              onClick={() => setTopicsOpen((current) => !current)}
            >
              {topicsOpen ? 'Hide topics' : 'Filter topics'}
            </button>
          </div>
          {topicsOpen ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
              <div className="flex flex-wrap gap-3">
                {topics.map((topic) => (
                  <label
                    key={topic.id}
                    className="flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 cursor-pointer hover:bg-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopicIds.includes(topic.id)}
                      onChange={() => handleToggleTopic(topic.id)}
                    />
                    <span>{topic.name}</span>
                  </label>
                ))}
                {topics.length === 0 ? (
                  <p className="text-sm text-slate-400">Loading topics...</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Question Source</h2>
          <select
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
            value={source}
            onChange={(event) => setSource(event.target.value as SourceOption)}
          >
            <option value="all">All questions</option>
            <option value="unseen">Unseen only</option>
            <option value="not_mastered">Not mastered (fewer than {config?.masteryThreshold ?? 3} correct)</option>
          </select>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Number of Questions</h2>
          <input
            type="number"
            min={1}
            max={questions.length || 60}
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
            className="w-32 rounded-md border border-slate-700 bg-slate-900 px-3 py-2"
          />
          <p className="text-sm text-slate-400">
            {questions.length} questions available in total.
          </p>
        </section>

        <div className="space-y-2">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-700"
            disabled={isSubmitting || questions.length === 0}
          >
            {isSubmitting ? 'Building quiz...' : 'Build quiz'}
          </button>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {diagnostics.length > 0 ? (
            <ul className="text-sm text-slate-400">
              {diagnostics.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </form>
    </section>
  );
};

export default CreateTest;
