import type { Attempt, Question, QuestionType, Test } from '../models';

const NOT_MASTERED_THRESHOLD = 3;

export interface TestBuilderOptions {
  questions: Question[];
  attempts: Attempt[];
  subjectIds: string[];
  topicIds: string[];
  selectionPolicy: Test['selectionPolicy'];
  size: number;
  masteryThreshold?: number;
}

export interface TestBuilderResult {
  questionIds: string[];
  diagnostics: string[];
}

interface QuestionAttemptStats {
  total: number;
  correct: number;
}

const buildAttemptIndex = (attempts: Attempt[]): Map<string, QuestionAttemptStats> => {
  const index = new Map<string, QuestionAttemptStats>();
  for (const attempt of attempts) {
    const current = index.get(attempt.questionId) ?? { total: 0, correct: 0 };
    current.total += 1;
    if (attempt.isCorrect) {
      current.correct += 1;
    }
    index.set(attempt.questionId, current);
  }
  return index;
};

const matchesTopics = (question: Question, topicIds: string[]): boolean => {
  if (topicIds.length === 0) {
    return true;
  }
  return question.topicIds.some((topicId) => topicIds.includes(topicId));
};

const matchesTypes = (question: Question, allowedTypes: QuestionType[]): boolean => {
  if (allowedTypes.length === 0) {
    return true;
  }
  return allowedTypes.includes(question.type);
};

const matchesSourcePolicy = (
  question: Question,
  statsIndex: Map<string, QuestionAttemptStats>,
  source: Test['selectionPolicy']['source'],
  masteryThreshold: number,
): boolean => {
  const stats = statsIndex.get(question.id);

  if (source === 'all') {
    return true;
  }

  if (!stats) {
    return source === 'unseen' || source === 'not_mastered';
  }

  if (source === 'unseen') {
    return stats.total === 0;
  }

  if (source === 'not_mastered') {
    return stats.correct < masteryThreshold;
  }

  return true;
};

const shuffleInPlace = <T>(items: T[]): void => {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const currentValue = items[i];
    const swapValue = items[j];
    if (currentValue === undefined || swapValue === undefined) {
      continue;
    }
    items[i] = swapValue;
    items[j] = currentValue;
  }
};

export const buildTest = (options: TestBuilderOptions): TestBuilderResult => {
  const {
    questions,
    attempts,
    subjectIds,
    topicIds,
    selectionPolicy,
    size,
    masteryThreshold = NOT_MASTERED_THRESHOLD,
  } = options;

  const statsIndex = buildAttemptIndex(attempts);
  const subjectsFilter = subjectIds.length > 0 ? new Set(subjectIds) : undefined;

  const filtered = questions.filter((question) => {
    if (subjectsFilter && !subjectsFilter.has(question.subjectId)) {
      return false;
    }

    if (!matchesTopics(question, topicIds)) {
      return false;
    }

    if (!matchesTypes(question, selectionPolicy.types)) {
      return false;
    }

    return matchesSourcePolicy(question, statsIndex, selectionPolicy.source, masteryThreshold);
  });

  if (filtered.length < size) {
    return {
      questionIds: [],
      diagnostics: [
        `Insufficient questions after filtering. Requested ${size}, available ${filtered.length}.`,
      ],
    };
  }

  const candidateIds = filtered.map((question) => question.id);
  shuffleInPlace(candidateIds);

  const selectedIds = candidateIds.slice(0, size);

  return {
    questionIds: selectedIds,
    diagnostics: [`Selected ${selectedIds.length} questions from pool of ${filtered.length}.`],
  };
};

export const generateSelectionTypes = (types: QuestionType[]): QuestionType[] => {
  return Array.from(new Set(types));
};
