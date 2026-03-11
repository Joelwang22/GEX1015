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
    const question = questions[test.currentIndex];
    return question;
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
    if (storedAnswer?.pbqAnswer !== undefined) {
      setLocalPBQAnswer(storedAnswer.pbqAnswer);
    } else if (currentQuestion.type === 'pbq_order') {
      const config = currentQuestion.pbqSpec.configuration as { ordering?: string[] };
      const baseOrdering = Array.isArray(config.ordering) ? [...config.ordering] : [];
      for (let i = baseOrdering.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const currentValue = baseOrdering[i];
        const swapValue = baseOrdering[j];
        if (currentValue === undefined || swapValue === undefined) {
          continue;
        }
        baseOrdering[i] = swapValue;
        baseOrdering[j] = currentValue;
      }
      setLocalPBQAnswer(baseOrdering);
    } else if (currentQuestion.type === 'pbq_match') {
      const config = currentQuestion.pbqSpec.configuration as {
        pairs?: Array<{ secure: string; legacy: string }>;
      };
      setLocalPBQAnswer(
        Array.isArray(config.pairs)
          ? config.pairs.map((pair) => ({ secure: pair.secure, legacy: '' }))
          : [],
      );
    } else if (currentQuestion.type === 'pbq_fill') {
      setLocalPBQAnswer(typeof storedAnswer?.pbqAnswer === 'string' ? storedAnswer.pbqAnswer : '');
    } else {
      setLocalPBQAnswer(storedAnswer?.pbqAnswer);
    }
    interactionTimestamp.current = Date.now();
  }, [test, currentQuestion]);


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
    const index = test.currentIndex + 1;
    return `Question ${Math.min(index, questions.length)} of ${questions.length}`;
  }, [test, questions.length]);

  const testIdentifier = test?.id ?? null;

  const persistTimeRemaining = useCallback(
    async (remaining: number) => {
      if (!testIdentifier) {
        return;
      }
      await db.tests.update(testIdentifier, { timeRemainingMs: remaining });
      setTest((current) => (current ? { ...current, timeRemainingMs: remaining } : current));
    },
    [testIdentifier],
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

  const updateTestRecord = async (updates: Partial<Test>): Promise<Test | null> => {
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
  };

  const handleSubmit = async (): Promise<void> => {
    if (!test || !currentQuestion) {
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

      setLocalPBQAnswer(pbqAnswer);

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
  };

  const persistAttempts = async (finalTest: Test): Promise<void> => {
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
  };

  const handleComplete = async (): Promise<void> => {
    if (!test) {
      return;
    }

    const totalCorrect = correctCount;
    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
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
  };

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

  const handleNext = async (): Promise<void> => {
    if (!test) {
      return;
    }

    const currentQuestionId = test.questionIds[test.currentIndex];
    if (!currentQuestionId) {
      setStatusMessage('Current question is unavailable.');
      return;
    }

    const answeredCurrent = Boolean(test.answers[currentQuestionId]);

    if (!answeredCurrent && test.currentIndex < questions.length - 1) {
      setStatusMessage('Please submit an answer before moving to the next question.');
      return;
    }

    if (test.currentIndex >= questions.length - 1) {
      await handleComplete();
      return;
    }

    await updateTestRecord({ currentIndex: test.currentIndex + 1 });
  };

  const handlePrev = async (): Promise<void> => {
    if (!test) {
      return;
    }
    const previousIndex = Math.max(0, test.currentIndex - 1);
    await updateTestRecord({ currentIndex: previousIndex });
  };

  const handleToggleReview = async (): Promise<void> => {
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
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!currentQuestion) {
        return;
      }

      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement && ['INPUT', 'SELECT', 'TEXTAREA'].includes(activeElement.tagName)) {
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
  }, [currentQuestion, handleNext, handleSubmit, handleToggleReview]);

  if (isLoading) {
    return <p className="text-slate-300">Loading test…</p>;
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
            <p className="text-sm font-semibold text-teal-300">{progressLabel}</p>
            <p className="text-sm text-slate-400">
              Score so far: {correctCount}/{questions.length} correct
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {config?.timerEnabled && timeRemainingMs !== null ? (
              <div className="min-w-[180px]">
                <TimerDisplay remainingMs={timeRemainingMs} />
              </div>
            ) : null}
            <div className="min-w-[200px]">
              <ProgressBar current={test.currentIndex + 1} total={questions.length} />
            </div>
          </div>
        </div>
      </header>

      {isMCQ(currentQuestion) ? (
        <MCQQuestion
          question={currentQuestion}
          selectedChoiceIds={localChoices}
          onToggleChoice={handleToggleChoice}
        />
      ) : null}

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
          onClick={handleSubmit}
          className="rounded-md bg-primary px-4 py-2 font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : 'Submit answer'}
        </button>
        <button
          type="button"
          onClick={handlePrev}
          className="rounded-md border border-slate-700 px-4 py-2 hover:bg-slate-800"
          disabled={test.currentIndex === 0}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="rounded-md border border-slate-700 px-4 py-2 hover:bg-slate-800"
          disabled={!answered}
        >
          {test.currentIndex >= questions.length - 1 ? 'Finish test' : 'Next'}
        </button>
        <button
          type="button"
          onClick={handleToggleReview}
          className={`rounded-md border px-4 py-2 ${
            isMarked ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-slate-700 hover:bg-slate-800'
          }`}
        >
          {isMarked ? 'Unmark review' : 'Mark for review'}
        </button>
        <button
          type="button"
          onClick={() => setIsHelpOpen(true)}
          className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
        >
          Keyboard help
        </button>
      </div>

      <div role="status" aria-live="polite" className="text-sm text-slate-300">
        {statusMessage}
      </div>

      {isHelpOpen ? (
        <OverlayModal title="Keyboard shortcuts" onClose={() => setIsHelpOpen(false)}>
          <ul className="space-y-2 text-sm text-slate-200">
            <li><strong>1 – 9</strong>: Toggle the corresponding option</li>
            <li><strong>Enter</strong>: Submit the current answer</li>
            <li><strong>N</strong>: Move to the next question</li>
            <li><strong>R</strong>: Mark or unmark the question for review</li>
            <li><strong>Arrow keys / buttons</strong>: Adjust PBQ order items</li>
            <li><strong>Tab</strong>: Navigate between interactive controls</li>
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
        <button className="text-slate-400" onClick={onClose}>
          Close
        </button>
      </header>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

export default TestRunner;
