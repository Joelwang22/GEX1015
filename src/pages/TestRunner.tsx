import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MCQQuestion, ProgressBar, TimerDisplay } from '../components';
import { db, DEFAULT_TEST_DURATION_MINUTES } from '../db';
import {
  isMCQ,
  type AppConfig,
  type Attempt,
  type Question,
  type Test,
  type TestAttemptAnswer,
} from '../models';
import { gradeQuestion } from '../logic/grader';
import { formatExplanationWithOptionLineBreaks } from '../logic/formatExplanation';

interface NavigatorItem {
  index: number;
  questionId: string;
  answered: boolean;
  marked: boolean;
}

interface ReviewItem extends NavigatorItem {
  stem: string;
}

const normalizeChoiceIds = (choiceIds: string[] | undefined): string[] =>
  Array.isArray(choiceIds) ? [...choiceIds].sort() : [];

const serializeStoredAnswer = (question: Question, answer?: TestAttemptAnswer): string => {
  if (isMCQ(question)) {
    return JSON.stringify(normalizeChoiceIds(answer?.chosenChoiceIds));
  }

  return JSON.stringify(answer?.pbqAnswer ?? null);
};

const serializeDraftAnswer = (
  question: Question,
  localChoices: string[],
  localPBQAnswer: unknown,
): string => {
  if (isMCQ(question)) {
    return JSON.stringify(normalizeChoiceIds(localChoices));
  }

  return JSON.stringify(localPBQAnswer ?? null);
};

const QuestionNavigator = ({
  items,
  currentIndex,
  onJump,
  isCollapsed,
  onToggleCollapsed,
  isReviewOpen,
  onToggleReviewScreen,
}: {
  items: NavigatorItem[];
  currentIndex: number;
  onJump: (index: number) => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  isReviewOpen: boolean;
  onToggleReviewScreen: () => void;
}): JSX.Element => {
  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={onToggleCollapsed}
        className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 p-3 text-center hover:bg-slate-800/60"
        aria-label="Expand question navigator"
      >
        <span className="text-sm font-semibold text-slate-100">Question Navigator</span>
      </button>
    );
  }

  return (
    <aside className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Question Navigator</h2>
        </div>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="rounded-md border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          aria-expanded
          aria-label="Collapse question navigator"
        >
          Collapse
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {items.map((item) => {
          const classes = item.index === currentIndex
            ? 'border-teal-400 bg-teal-500/20 text-teal-100'
            : item.marked
            ? 'border-amber-500 bg-amber-500/10 text-amber-200'
            : item.answered
            ? 'border-emerald-600 bg-emerald-500/10 text-emerald-200'
            : 'border-slate-700 bg-slate-950/70 text-slate-300 hover:bg-slate-800';

          return (
            <button
              key={item.questionId}
              type="button"
              onClick={() => onJump(item.index)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${classes}`}
              aria-label={`Go to question ${item.index + 1}`}
            >
              {item.index + 1}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onToggleReviewScreen}
        className="w-full rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
      >
        {isReviewOpen ? 'Close review screen' : 'Open review screen'}
      </button>
    </aside>
  );
};

const ReviewScreen = ({
  items,
  unansweredCount,
  markedCount,
  correctCount,
  onJump,
  onClose,
  onComplete,
}: {
  items: ReviewItem[];
  unansweredCount: number;
  markedCount: number;
  correctCount: number;
  onJump: (index: number) => void;
  onClose: () => void;
  onComplete: () => void;
}): JSX.Element => (
  <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
    <header className="space-y-2">
      <h2 className="text-2xl font-semibold">Review Quiz</h2>
      <p className="text-sm text-slate-400">
        Check unanswered or marked questions before you submit the test.
      </p>
    </header>

    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-xl border border-emerald-800 bg-emerald-900/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">Correct so far</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-100">{correctCount}</p>
      </div>
      <div className="rounded-xl border border-amber-800 bg-amber-900/10 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-300">Marked</p>
        <p className="mt-2 text-2xl font-semibold text-amber-100">{markedCount}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Unanswered</p>
        <p className="mt-2 text-2xl font-semibold text-slate-100">{unansweredCount}</p>
      </div>
    </div>

    {unansweredCount > 0 ? (
      <p className="rounded-xl border border-amber-700/60 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        Answer every question before you submit the quiz.
      </p>
    ) : null}

    <div className="space-y-3">
      {items.map((item) => (
        <button
          key={item.questionId}
          type="button"
          onClick={() => onJump(item.index)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-left transition hover:border-teal-400 hover:bg-slate-900"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
            <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-300">
              Question {item.index + 1}
            </span>
            {item.answered ? (
              <span className="rounded-full border border-emerald-700 bg-emerald-900/20 px-3 py-1 text-emerald-300">
                Answered
              </span>
            ) : (
              <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-400">
                Unanswered
              </span>
            )}
            {item.marked ? (
              <span className="rounded-full border border-amber-700 bg-amber-900/20 px-3 py-1 text-amber-300">
                Marked
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-200">{item.stem}</p>
        </button>
      ))}
    </div>

    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={onClose}
        className="rounded-md border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
      >
        Back to quiz
      </button>
      <button
        type="button"
        onClick={onComplete}
        disabled={unansweredCount > 0}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-700"
      >
        Submit quiz
      </button>
    </div>
  </div>
);

const TestRunner = (): JSX.Element => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [localChoices, setLocalChoices] = useState<string[]>([]);
  const [localPBQAnswer, setLocalPBQAnswer] = useState<unknown>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [isNavigatorCollapsed, setIsNavigatorCollapsed] = useState<boolean>(true);

  const interactionTimestamp = useRef<number>(Date.now());
  const timerPersistRef = useRef<number>(0);

  const loadTest = useCallback(async () => {
    if (!testId) {
      setError('Missing test identifier.');
      setIsLoading(false);
      return;
    }

    try {
      const record = await db.tests.get(testId);
      if (!record) {
        setError('Test not found.');
        setIsLoading(false);
        return;
      }

      const questionRecords = await db.questions.bulkGet(record.questionIds);
      const questionMap = new Map<string, Question>();
      questionRecords.forEach((question) => {
        if (question) {
          questionMap.set(question.id, question);
        }
      });

      const orderedQuestions = record.questionIds
        .map((id) => questionMap.get(id))
        .filter((question): question is Question => Boolean(question));

      if (orderedQuestions.length === 0) {
        setError('No questions available for this test.');
        setIsLoading(false);
        return;
      }

      setQuestions(orderedQuestions);
      setTest(record);
      setIsLoading(false);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load test.');
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    void loadTest();
  }, [loadTest]);

  useEffect(() => {
    const fetchConfig = async (): Promise<void> => {
      const settings = await db.config.get('settings');
      setConfig(settings ?? { id: 'settings', masteryThreshold: 3, timerEnabled: false });
    };

    void fetchConfig();
  }, []);

  const currentQuestion = useMemo(() => {
    if (!test) {
      return undefined;
    }
    return questions[test.currentIndex];
  }, [test, questions]);

  useEffect(() => {
    if (!config || !test) {
      return;
    }

    if (!config.timerEnabled) {
      setTimeRemainingMs(null);
      timerPersistRef.current = 0;
      return;
    }

    if (typeof test.timeRemainingMs === 'number') {
      setTimeRemainingMs(test.timeRemainingMs);
      timerPersistRef.current = 0;
    } else {
      const initial = DEFAULT_TEST_DURATION_MINUTES * 60 * 1000;
      setTimeRemainingMs(initial);
      void db.tests.update(test.id, { timeRemainingMs: initial });
      setTest((current) => (current ? { ...current, timeRemainingMs: initial } : current));
      timerPersistRef.current = 0;
    }
  }, [config, test]);

  useEffect(() => {
    if (!test || !currentQuestion) {
      return;
    }

    const storedAnswer = test.answers[currentQuestion.id];
    setLocalChoices(isMCQ(currentQuestion) ? storedAnswer?.chosenChoiceIds ?? [] : []);
    setLocalPBQAnswer(storedAnswer?.pbqAnswer);
    interactionTimestamp.current = Date.now();
  }, [test, currentQuestion]);

  const questionItems = useMemo<NavigatorItem[]>(() => {
    if (!test) {
      return [];
    }

    return questions.map((question, index) => ({
      index,
      questionId: question.id,
      answered: Boolean(test.answers[question.id]),
      marked: test.markedForReview.includes(question.id),
    }));
  }, [questions, test]);

  const reviewItems = useMemo<ReviewItem[]>(
    () =>
      questionItems.map((item) => ({
        ...item,
        stem: questions[item.index]?.stem ?? 'Question unavailable.',
      })),
    [questionItems, questions],
  );

  const answeredCount = useMemo(
    () => questionItems.filter((item) => item.answered).length,
    [questionItems],
  );

  const markedCount = useMemo(
    () => questionItems.filter((item) => item.marked).length,
    [questionItems],
  );

  const unansweredCount = questions.length - answeredCount;

  const correctCount = useMemo(() => {
    if (!test) {
      return 0;
    }
    return Object.values(test.answers).filter((answer) => answer?.isCorrect).length;
  }, [test]);

  const progressLabel = useMemo(() => {
    if (!test || questions.length === 0) {
      return 'No questions loaded';
    }
    return `Question ${Math.min(test.currentIndex + 1, questions.length)} of ${questions.length}`;
  }, [questions.length, test]);

  const hasUnsavedChanges = useMemo(() => {
    if (!test || !currentQuestion) {
      return false;
    }

    return (
      serializeStoredAnswer(currentQuestion, test.answers[currentQuestion.id]) !==
      serializeDraftAnswer(currentQuestion, localChoices, localPBQAnswer)
    );
  }, [currentQuestion, localChoices, localPBQAnswer, test]);

  const persistTimeRemaining = useCallback(
    async (remaining: number) => {
      if (!test?.id) {
        return;
      }

      await db.tests.update(test.id, { timeRemainingMs: remaining });
      setTest((current) => (current ? { ...current, timeRemainingMs: remaining } : current));
    },
    [test],
  );

  const updateTestRecord = useCallback(
    async (updates: Partial<Test>): Promise<Test | null> => {
      if (!test) {
        return null;
      }

      const timeDelta = Date.now() - interactionTimestamp.current;
      const nextTimeSpent = (test.timeSpentMs ?? 0) + timeDelta;

      const nextRecord: Test = {
        ...test,
        ...updates,
        timeSpentMs: nextTimeSpent,
      };

      await db.tests.put(nextRecord);
      setTest(nextRecord);
      interactionTimestamp.current = Date.now();
      return nextRecord;
    },
    [test],
  );

  const handleToggleChoice = (choiceId: string): void => {
    if (!currentQuestion || !isMCQ(currentQuestion)) {
      return;
    }

    setLocalChoices((current) => {
      if (currentQuestion.type === 'mcq_single') {
        return [choiceId];
      }

      if (current.includes(choiceId)) {
        return current.filter((id) => id !== choiceId);
      }

      return [...current, choiceId];
    });
  };

  const persistAttempts = useCallback(
    async (finalTest: Test): Promise<void> => {
      const attempts: Attempt[] = questions.map((question) => {
        const answer = finalTest.answers[question.id];
        return {
          id:
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
              ? crypto.randomUUID()
              : `attempt-${question.id}-${Date.now()}`,
          questionId: question.id,
          testId: finalTest.id,
          submittedAt: answer?.submittedAt ?? new Date().toISOString(),
          isCorrect: Boolean(answer?.isCorrect),
          chosenChoiceIds: answer?.chosenChoiceIds,
          pbqAnswer: answer?.pbqAnswer,
          subjectId: question.subjectId,
          topicIds: question.topicIds,
        };
      });

      try {
        await db.attempts.bulkAdd(attempts);
      } catch (attemptError) {
        console.error('Failed bulkAdd, retrying individually', attemptError);
        for (const attempt of attempts) {
          try {
            await db.attempts.put(attempt);
          } catch (singleError) {
            console.error('Failed to persist attempt', singleError);
          }
        }
      }
    },
    [questions],
  );

  const handleComplete = useCallback(async (): Promise<void> => {
    if (!test || unansweredCount > 0) {
      setStatusMessage('Answer every question before submitting the quiz.');
      return;
    }

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const completedAt = new Date().toISOString();

    try {
      const updatedTest = await updateTestRecord({
        status: 'completed',
        score,
        completedAt,
      });

      if (!updatedTest) {
        return;
      }

      await persistAttempts(updatedTest);

      const existingUserState = await db.userState.get('singleton');
      await db.userState.put({
        ...existingUserState,
        id: 'singleton',
        lastTestId: undefined,
      });

      navigate('/results', { replace: true, state: { testId: updatedTest.id } });
    } catch (completeError) {
      setStatusMessage(completeError instanceof Error ? completeError.message : 'Failed to complete test.');
    }
  }, [correctCount, navigate, persistAttempts, questions.length, test, unansweredCount, updateTestRecord]);

  useEffect(() => {
    if (!config?.timerEnabled || !test || test.status !== 'in_progress') {
      return;
    }
    if (timeRemainingMs === null) {
      return;
    }
    if (timeRemainingMs <= 0) {
      void handleComplete();
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeRemainingMs((current) => {
        if (current === null) {
          return current;
        }

        const next = Math.max(0, current - 1000);
        timerPersistRef.current += 1000;
        if (timerPersistRef.current >= 5000 || next === 0) {
          timerPersistRef.current = 0;
          void persistTimeRemaining(next);
        }
        if (next === 0) {
          void handleComplete();
        }
        return next;
      });
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [config?.timerEnabled, handleComplete, persistTimeRemaining, test, timeRemainingMs]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!test || !currentQuestion) {
      return;
    }

    if (isMCQ(currentQuestion) && localChoices.length === 0) {
      setStatusMessage('Select an answer before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      let pbqAnswer = localPBQAnswer;
      if (currentQuestion.type === 'pbq_group' && typeof pbqAnswer === 'string') {
        try {
          pbqAnswer = JSON.parse(pbqAnswer);
        } catch {
          setStatusMessage('Unable to parse PBQ group answer, please provide valid JSON.');
          setSubmitting(false);
          return;
        }
      }

      const outcome = gradeQuestion(currentQuestion, {
        selectedChoiceIds: localChoices,
        pbqAnswer,
      });

      const updatedAnswers: Record<string, TestAttemptAnswer> = {
        ...test.answers,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          chosenChoiceIds: localChoices,
          pbqAnswer,
          isCorrect: outcome.isCorrect,
          submittedAt: new Date().toISOString(),
        },
      };

      const updatedTest = await updateTestRecord({ answers: updatedAnswers });

      if (!updatedTest) {
        setStatusMessage('Failed to record answer.');
        return;
      }

      setStatusMessage(outcome.isCorrect ? 'Correct answer recorded.' : 'Answer recorded. Review later.');
    } catch (submitError) {
      setStatusMessage(submitError instanceof Error ? submitError.message : 'Failed to grade answer.');
    } finally {
      setSubmitting(false);
    }
  }, [currentQuestion, localChoices, localPBQAnswer, test, updateTestRecord]);

  const handleJumpToQuestion = useCallback(
    async (index: number): Promise<void> => {
      if (!test) {
        return;
      }

      if (hasUnsavedChanges) {
        setStatusMessage('Submit or clear your current answer before leaving this question.');
        return;
      }

      setIsReviewOpen(false);
      setStatusMessage('');
      await updateTestRecord({ currentIndex: index });
    },
    [hasUnsavedChanges, test, updateTestRecord],
  );

  const handleOpenReview = useCallback((): void => {
    if (hasUnsavedChanges) {
      setStatusMessage('Submit or clear your current answer before opening review.');
      return;
    }

    setIsReviewOpen(true);
    setStatusMessage('');
  }, [hasUnsavedChanges]);

  const handleCloseReview = useCallback((): void => {
    setIsReviewOpen(false);
    setStatusMessage('');
  }, []);

  const handleToggleReviewScreen = useCallback((): void => {
    if (isReviewOpen) {
      handleCloseReview();
      return;
    }

    handleOpenReview();
  }, [handleCloseReview, handleOpenReview, isReviewOpen]);

  const handleNext = useCallback(async (): Promise<void> => {
    if (!test) {
      return;
    }

    const currentQuestionId = test.questionIds[test.currentIndex];
    if (!currentQuestionId) {
      setStatusMessage('Current question is unavailable.');
      return;
    }

    if (hasUnsavedChanges) {
      setStatusMessage('Submit or clear your current answer before moving on.');
      return;
    }

    const answeredCurrent = Boolean(test.answers[currentQuestionId]);
    if (!answeredCurrent) {
      setStatusMessage('Please submit an answer before moving to the next question.');
      return;
    }

    if (test.currentIndex >= questions.length - 1) {
      setIsReviewOpen(true);
      setStatusMessage('');
      return;
    }

    await updateTestRecord({ currentIndex: test.currentIndex + 1 });
  }, [hasUnsavedChanges, questions.length, test, updateTestRecord]);

  const handlePrev = useCallback(async (): Promise<void> => {
    if (!test) {
      return;
    }

    if (hasUnsavedChanges) {
      setStatusMessage('Submit or clear your current answer before leaving this question.');
      return;
    }

    await updateTestRecord({ currentIndex: Math.max(0, test.currentIndex - 1) });
  }, [hasUnsavedChanges, test, updateTestRecord]);

  const handleToggleReview = useCallback(async (): Promise<void> => {
    if (!test || !currentQuestion) {
      return;
    }

    const nextMarked = test.markedForReview.includes(currentQuestion.id)
      ? test.markedForReview.filter((id) => id !== currentQuestion.id)
      : [...test.markedForReview, currentQuestion.id];

    await updateTestRecord({ markedForReview: nextMarked });
    setStatusMessage(
      nextMarked.includes(currentQuestion.id)
        ? 'Question marked for review.'
        : 'Question unmarked from review.',
    );
  }, [currentQuestion, test, updateTestRecord]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(activeElement.tagName)) {
        return;
      }

      if (isReviewOpen) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setIsReviewOpen(false);
        }
        return;
      }

      if (!currentQuestion) {
        return;
      }

      if (event.key >= '1' && event.key <= '9' && isMCQ(currentQuestion)) {
        const choiceIndex = Number(event.key) - 1;
        const choice = currentQuestion.choices[choiceIndex];
        if (choice) {
          event.preventDefault();
          handleToggleChoice(choice.id);
        }
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        void handleSubmit();
      }

      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        void handleNext();
      }

      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        void handleToggleReview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestion, handleNext, handleSubmit, handleToggleReview, isReviewOpen]);

  if (isLoading) {
    return <p className="text-slate-300">Loading test...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  if (!test || !currentQuestion) {
    return <p className="text-red-400">No questions to display.</p>;
  }

  const answered = Boolean(test.answers[currentQuestion.id]);
  const isMarked = test.markedForReview.includes(currentQuestion.id);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Test Runner</h1>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-300">
              {isReviewOpen ? 'Review screen' : progressLabel}
            </p>
            <p className="text-sm text-slate-400">
              Score so far: {correctCount}/{questions.length} correct
            </p>
          </div>
          <div className="flex flex-wrap items-start justify-end gap-4">
            {config?.timerEnabled && timeRemainingMs !== null ? (
              <div className="min-w-[180px]">
                <TimerDisplay remainingMs={timeRemainingMs} />
              </div>
            ) : null}
            <div className="flex flex-wrap items-start justify-end gap-4">
              <div className="min-w-[220px]">
                <ProgressBar
                  current={test.currentIndex + 1}
                  total={questions.length}
                  answeredCount={answeredCount}
                  markedCount={markedCount}
                />
              </div>
              {isNavigatorCollapsed ? (
                <div className="w-[6.5rem] shrink-0">
                  <QuestionNavigator
                    items={questionItems}
                    currentIndex={test.currentIndex}
                    onJump={(index) => {
                      void handleJumpToQuestion(index);
                    }}
                    isCollapsed
                    onToggleCollapsed={() => setIsNavigatorCollapsed(false)}
                    isReviewOpen={isReviewOpen}
                    onToggleReviewScreen={handleToggleReviewScreen}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className={`gap-6 ${!isNavigatorCollapsed ? 'xl:grid xl:grid-cols-[minmax(0,1fr)_20rem]' : ''}`}>
        <div className="space-y-6">
          {isReviewOpen ? (
            <ReviewScreen
              items={reviewItems}
              unansweredCount={unansweredCount}
              markedCount={markedCount}
              correctCount={correctCount}
              onJump={(index) => {
                void handleJumpToQuestion(index);
              }}
              onClose={handleCloseReview}
              onComplete={() => {
                void handleComplete();
              }}
            />
          ) : (
            <>
              {isMCQ(currentQuestion) ? (
                <MCQQuestion
                  question={currentQuestion}
                  selectedChoiceIds={localChoices}
                  onToggleChoice={handleToggleChoice}
                />
              ) : (
                <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-300">
                  This question type is not yet supported in the runner UI.
                </div>
              )}

              {answered && currentQuestion.explanation ? (
                <div className="space-y-1 rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                  <h3 className="text-sm font-semibold text-slate-200">Explanation</h3>
                  <p className="whitespace-pre-line text-sm text-slate-300">
                    {isMCQ(currentQuestion)
                      ? formatExplanationWithOptionLineBreaks(currentQuestion.explanation, currentQuestion.choices.length)
                      : currentQuestion.explanation.trim()}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void handleSubmit();
                  }}
                  className="rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : answered ? 'Resubmit answer' : 'Submit answer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handlePrev();
                  }}
                  className="rounded-md border border-slate-700 px-4 py-2 hover:bg-slate-800"
                  disabled={test.currentIndex === 0}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleNext();
                  }}
                  className="rounded-md border border-slate-700 px-4 py-2 hover:bg-slate-800"
                >
                  {test.currentIndex >= questions.length - 1 ? 'Review quiz' : 'Next'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleToggleReview();
                  }}
                  className={`rounded-md border px-4 py-2 ${
                    isMarked ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {isMarked ? 'Unmark review' : 'Mark for review'}
                </button>
                <button
                  type="button"
                  onClick={handleToggleReviewScreen}
                  className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                >
                  {isReviewOpen ? 'Close review screen' : 'Open review screen'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsHelpOpen(true)}
                  className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
                >
                  Keyboard help
                </button>
              </div>
            </>
          )}

          <div role="status" aria-live="polite" className="text-sm text-slate-300">
            {statusMessage}
          </div>
        </div>

        {!isNavigatorCollapsed ? (
          <aside className="hidden xl:block">
            <QuestionNavigator
              items={questionItems}
              currentIndex={test.currentIndex}
              onJump={(index) => {
                void handleJumpToQuestion(index);
              }}
              isCollapsed={false}
              onToggleCollapsed={() => setIsNavigatorCollapsed(true)}
              isReviewOpen={isReviewOpen}
              onToggleReviewScreen={handleToggleReviewScreen}
            />
          </aside>
        ) : null}
      </div>

      {!isNavigatorCollapsed ? (
        <div className="xl:hidden">
          <OverlayModal title="Question Navigator" onClose={() => setIsNavigatorCollapsed(true)}>
            <QuestionNavigator
              items={questionItems}
              currentIndex={test.currentIndex}
              onJump={(index) => {
                void handleJumpToQuestion(index);
                setIsNavigatorCollapsed(true);
              }}
              isCollapsed={false}
              onToggleCollapsed={() => setIsNavigatorCollapsed(true)}
              isReviewOpen={isReviewOpen}
              onToggleReviewScreen={handleToggleReviewScreen}
            />
          </OverlayModal>
        </div>
      ) : null}

      {isHelpOpen ? (
        <OverlayModal title="Keyboard shortcuts" onClose={() => setIsHelpOpen(false)}>
          <ul className="space-y-2 text-sm text-slate-200">
            <li><strong>1 - 9</strong>: Toggle the corresponding option</li>
            <li><strong>Enter</strong>: Submit the current answer</li>
            <li><strong>N</strong>: Move to the next question</li>
            <li><strong>R</strong>: Mark or unmark the question for review</li>
            <li><strong>Esc</strong>: Close the review or help overlay</li>
            <li><strong>Tab</strong>: Move between interactive controls</li>
          </ul>
        </OverlayModal>
      ) : null}
    </section>
  );
};

interface OverlayModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

const OverlayModal = ({ title, children, onClose }: OverlayModalProps): JSX.Element => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
    <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-950 shadow-xl" role="dialog" aria-modal="true">
      <header className="flex items-center justify-between border-b border-slate-800 p-4">
        <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
        <button type="button" className="text-slate-400" onClick={onClose}>
          Close
        </button>
      </header>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

export default TestRunner;
