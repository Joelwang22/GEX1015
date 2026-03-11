import type { Attempt, Question, Test } from '../models';

export interface OverallAccuracy {
  totalAttempts: number;
  correct: number;
  accuracy: number;
}

export interface TopicAccuracy {
  topicId: string;
  attempts: number;
  correct: number;
  accuracy: number;
}

export const calculateOverallAccuracy = (attempts: Attempt[]): OverallAccuracy => {
  const correct = attempts.filter((attempt) => attempt.isCorrect).length;
  const totalAttempts = attempts.length;
  const accuracy = totalAttempts === 0 ? 0 : correct / totalAttempts;
  return { totalAttempts, correct, accuracy };
};

export const calculateTopicAccuracy = (
  attempts: Attempt[],
  questions: Question[],
): TopicAccuracy[] => {
  const questionLookup = new Map(questions.map((question) => [question.id, question]));
  const byTopic = new Map<string, { attempts: number; correct: number }>();

  for (const attempt of attempts) {
    const question = questionLookup.get(attempt.questionId);
    const topicIds = question?.topicIds ?? attempt.topicIds;

    for (const topicId of topicIds) {
      const record = byTopic.get(topicId) ?? { attempts: 0, correct: 0 };
      record.attempts += 1;
      if (attempt.isCorrect) {
        record.correct += 1;
      }
      byTopic.set(topicId, record);
    }
  }

  return Array.from(byTopic.entries()).map(([topicId, stats]) => ({
    topicId,
    attempts: stats.attempts,
    correct: stats.correct,
    accuracy: stats.attempts === 0 ? 0 : stats.correct / stats.attempts,
  }));
};

export const findWeakTopics = (topicAccuracies: TopicAccuracy[], minimumAttempts = 10): TopicAccuracy[] => {
  const candidates = topicAccuracies.filter((topic) => topic.attempts >= minimumAttempts);
  const lowestAccuracy = candidates.reduce<number>((lowest, topic) => {
    return topic.accuracy < lowest ? topic.accuracy : lowest;
  }, Number.POSITIVE_INFINITY);

  if (!Number.isFinite(lowestAccuracy)) {
    return [];
  }

  return candidates.filter((topic) => topic.accuracy === lowestAccuracy);
};

export interface OverallWindows {
  lastTest: OverallAccuracy;
  sevenDays: OverallAccuracy;
  allTime: OverallAccuracy;
}

export const calculateOverallWindows = (
  attempts: Attempt[],
  tests: Test[],
  windowDays = 7,
  referenceDate: Date = new Date(),
): OverallWindows => {
  const allTime = calculateOverallAccuracy(attempts);

  const windowMs = windowDays * 24 * 60 * 60 * 1000;
  const windowStart = referenceDate.getTime() - windowMs;
  const windowAttempts = attempts.filter((attempt) => new Date(attempt.submittedAt).getTime() >= windowStart);
  const sevenDays = calculateOverallAccuracy(windowAttempts);

  const completedTests = [...tests]
    .filter((test) => test.status === 'completed')
    .sort((a, b) => new Date(b.completedAt ?? b.createdAt).getTime() - new Date(a.completedAt ?? a.createdAt).getTime());

  const lastTestAccuracy = (() => {
    const latest = completedTests[0];
    if (!latest) {
      return { totalAttempts: 0, correct: 0, accuracy: 0 } satisfies OverallAccuracy;
    }
    if (typeof latest.score === 'number') {
      const totalQuestions = latest.questionIds.length;
      return {
        totalAttempts: totalQuestions,
        correct: Math.round((latest.score / 100) * totalQuestions),
        accuracy: latest.score / 100,
      } satisfies OverallAccuracy;
    }
    const latestAttempts = attempts.filter((attempt) => attempt.testId === latest.id);
    return calculateOverallAccuracy(latestAttempts);
  })();

  return {
    lastTest: lastTestAccuracy,
    sevenDays,
    allTime,
  };
};
