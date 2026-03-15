import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { db, DEFAULT_TEST_DURATION_MINUTES } from '../db';
import { searchLessons, type LessonSearchResult } from '../data/gex1015Lessons';
import { formatExplanationWithOptionLineBreaks } from '../logic/formatExplanation';
import { isMCQ, type AppConfig, type Question, type Test, type TestAttemptAnswer, type Topic } from '../models';

const STOP_WORDS = new Set([
  'about',
  'after',
  'against',
  'because',
  'between',
  'could',
  'describe',
  'following',
  'moral',
  'morally',
  'philosophy',
  'question',
  'should',
  'their',
  'therefore',
  'these',
  'those',
  'which',
  'would',
]);

interface ReviewItem {
  question: Question;
  answer?: TestAttemptAnswer;
  topicNames: string[];
  relatedSlide: LessonSearchResult | null;
}

const getWeekTokens = (topicNames: string[]): string[] =>
  Array.from(
    new Set(
      topicNames.flatMap((name) =>
        Array.from(name.matchAll(/week\s+(\d+)/gi), (match) => `week ${match[1]}`),
      ),
    ),
  );

const lessonMatchesWeeks = (result: LessonSearchResult, weekTokens: string[]): boolean => {
  if (weekTokens.length === 0) {
    return true;
  }

  const haystack = `${result.lessonTitle} ${result.lessonSubtitle}`.toLowerCase();
  return weekTokens.some((token) => haystack.includes(token));
};

const buildSearchQueries = (question: Question, topicNames: string[]): string[] => {
  const topicalQueries = topicNames
    .map((name) => name.replace(/^Week\s+\d+\s*:\s*/i, '').trim().toLowerCase())
    .filter((name) => name.length >= 4);

  const rawText = [
    question.stem,
    question.explanation ?? '',
    ...topicNames,
    ...(isMCQ(question) ? question.choices.map((choice) => choice.text) : []),
  ]
    .join(' ')
    .toLowerCase();

  const keywordQueries = rawText
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (token) =>
        token.length >= 5 &&
        !STOP_WORDS.has(token) &&
        !/^\d+$/.test(token),
    );

  return Array.from(new Set([...topicalQueries, ...keywordQueries])).slice(0, 10);
};

const findRelatedLessonSlide = (question: Question, topicNames: string[]): LessonSearchResult | null => {
  const queries = buildSearchQueries(question, topicNames);
  const weekTokens = getWeekTokens(topicNames);

  const scoreMatches = (restrictToWeek: boolean): LessonSearchResult | null => {
    const scoredResults = new Map<string, { result: LessonSearchResult; score: number }>();

    queries.forEach((query, index) => {
      for (const result of searchLessons(query)) {
        if (restrictToWeek && !lessonMatchesWeeks(result, weekTokens)) {
          continue;
        }

        const key = `${result.lessonId}:${result.slideIndex}`;
        const current = scoredResults.get(key);
        const queryWeight = query.includes(' ') ? 6 : 2;
        const positionWeight = Math.max(0, 3 - index);
        const slideWeight =
          result.slideType === 'check'
            ? 2
            : result.slideType === 'concept' || result.slideType === 'term'
            ? 1
            : 0;

        scoredResults.set(key, {
          result,
          score: (current?.score ?? 0) + queryWeight + positionWeight + slideWeight,
        });
      }
    });

    return Array.from(scoredResults.values())
      .sort((a, b) => b.score - a.score || a.result.slideIndex - b.result.slideIndex)[0]
      ?.result ?? null;
  };

  return scoreMatches(true) ?? scoreMatches(false);
};

const getChoiceLabel = (question: Question, choiceId: string): string => {
  if (!isMCQ(question)) {
    return choiceId;
  }

  const index = question.choices.findIndex((choice) => choice.id === choiceId);
  if (index === -1) {
    return choiceId;
  }

  const choice = question.choices[index];
  return `${String.fromCharCode(65 + index)}. ${choice?.text ?? choiceId}`;
};

const formatUnknownValue = (value: unknown): string[] => {
  if (value === null || value === undefined) {
    return ['No answer submitted'];
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return ['No answer submitted'];
    }

    return value.map((item) =>
      typeof item === 'string' ? item : JSON.stringify(item),
    );
  }

  return [JSON.stringify(value, null, 2)];
};

const getSubmittedAnswerLines = (question: Question, answer?: TestAttemptAnswer): string[] => {
  if (isMCQ(question)) {
    if (!answer?.chosenChoiceIds || answer.chosenChoiceIds.length === 0) {
      return ['No answer submitted'];
    }

    return answer.chosenChoiceIds.map((choiceId) => getChoiceLabel(question, choiceId));
  }

  return formatUnknownValue(answer?.pbqAnswer);
};

const getCorrectAnswerLines = (question: Question): string[] => {
  if (isMCQ(question)) {
    return question.correctChoiceIds.map((choiceId) => getChoiceLabel(question, choiceId));
  }

  return question.explanation ? ['See explanation below.'] : ['Correct answer not available.'];
};

const getQuestionTypeLabel = (question: Question): string =>
  question.type === 'mcq_multi' ? 'Multi-select' : question.type === 'mcq_single' ? 'Single answer' : 'Practice block';

const Results = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const testId = (location.state as { testId?: string } | null)?.testId;
    if (!testId) {
      return;
    }

    const load = async (): Promise<void> => {
      try {
        const [record, topicRows, settings] = await Promise.all([
          db.tests.get(testId),
          db.topics.toArray(),
          db.config.get('settings'),
        ]);

        if (!record) {
          setError('Results unavailable.');
          return;
        }

        const questionRecords = await db.questions.bulkGet(record.questionIds);
        const orderedQuestions = record.questionIds
          .map((questionId) => questionRecords.find((question) => question?.id === questionId))
          .filter((question): question is Question => Boolean(question));

        setTest(record);
        setQuestions(orderedQuestions);
        setTopics(topicRows);
        setConfig(settings ?? { id: 'settings', masteryThreshold: 3, timerEnabled: false });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load results.');
      }
    };

    void load();
  }, [location.state]);

  const topicNameMap = useMemo(
    () => new Map(topics.map((topic) => [topic.id, topic.name])),
    [topics],
  );

  const reviewItems = useMemo<ReviewItem[]>(() => {
    return questions.map((question) => {
      const topicNames = question.topicIds.map((topicId) => topicNameMap.get(topicId) ?? topicId);
      return {
        question,
        answer: test?.answers[question.id],
        topicNames,
        relatedSlide: findRelatedLessonSlide(question, topicNames),
      };
    });
  }, [questions, test, topicNameMap]);

  const missedQuestionIds = useMemo(() => {
    if (!test) {
      return [];
    }
    return test.questionIds.filter((id) => test.answers[id]?.isCorrect === false);
  }, [test]);

  const summary = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    for (const item of reviewItems) {
      if (item.answer?.isCorrect === true) {
        correct += 1;
      } else if (item.answer?.isCorrect === false) {
        incorrect += 1;
      } else {
        unanswered += 1;
      }
    }

    return { correct, incorrect, unanswered };
  }, [reviewItems]);

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
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">Results</h1>
          <p className="text-slate-300">
            Completed {new Date(test.completedAt ?? test.createdAt).toLocaleString()} - Score: {test.score ?? 0}%
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {missedQuestionIds.length > 0 ? (
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-teal-600"
              onClick={handleRetryMissed}
            >
              Retry {missedQuestionIds.length} missed question{missedQuestionIds.length > 1 ? 's' : ''}
            </button>
          ) : null}
          <Link
            to="/quiz"
            className="inline-flex items-center rounded-md border border-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-800"
          >
            New quiz
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-800 bg-emerald-900/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">Correct</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-100">{summary.correct}</p>
        </div>
        <div className="rounded-xl border border-rose-800 bg-rose-900/10 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-300">Review</p>
          <p className="mt-2 text-2xl font-semibold text-rose-100">{summary.incorrect}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Unanswered</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{summary.unanswered}</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviewItems.map((item, index) => {
          const { question, answer, topicNames, relatedSlide } = item;
          const isCorrect = answer?.isCorrect === true;
          const explanation = question.explanation?.trim();
          const submittedAnswerLines = getSubmittedAnswerLines(question, answer);
          const correctAnswerLines = getCorrectAnswerLines(question);

          return (
            <article key={question.id} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <header className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
                    <span
                      className={`rounded-full px-3 py-1 ${
                        isCorrect
                          ? 'border border-emerald-700 bg-emerald-900/20 text-emerald-300'
                          : 'border border-rose-700 bg-rose-900/20 text-rose-300'
                      }`}
                    >
                      {isCorrect ? 'Correct' : answer ? 'Review' : 'Unanswered'}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-slate-400">
                      Question {index + 1}
                    </span>
                    <span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-slate-400">
                      {getQuestionTypeLabel(question)}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold leading-snug text-slate-100">{question.stem}</h2>
                  <div className="flex flex-wrap gap-2">
                    {topicNames.map((topicName) => (
                      <span
                        key={`${question.id}-${topicName}`}
                        className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-teal-300"
                      >
                        {topicName}
                      </span>
                    ))}
                  </div>
                </div>

                {relatedSlide ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/lessons/${relatedSlide.lessonIndex}?slide=${relatedSlide.slideIndex + 1}`)}
                    className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                  >
                    Open related slide
                  </button>
                ) : null}
              </header>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Your answer</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {submittedAnswerLines.map((line, lineIndex) => (
                      <li key={`${question.id}-submitted-${lineIndex}`} className="leading-relaxed">
                        {line}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-300">Correct answer</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    {correctAnswerLines.map((line, lineIndex) => (
                      <li key={`${question.id}-correct-${lineIndex}`} className="leading-relaxed">
                        {line}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {explanation ? (
                <section className="rounded-xl border border-violet-900/70 bg-violet-900/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-300">Explanation</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-200">
                    {isMCQ(question)
                      ? formatExplanationWithOptionLineBreaks(explanation, question.choices.length)
                      : explanation}
                  </p>
                </section>
              ) : null}

              {relatedSlide ? (
                <p className="text-sm text-slate-400">
                  Suggested review: {relatedSlide.lessonTitle}, slide {relatedSlide.slideIndex + 1} ({relatedSlide.slideLabel})
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

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
