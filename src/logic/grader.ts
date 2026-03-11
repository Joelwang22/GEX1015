import type { Question } from '../models';

export interface GradeDetails {
  message?: string;
  expected?: unknown;
}

export interface GradeOutcome {
  isCorrect: boolean;
  details?: GradeDetails;
}

export interface UserAnswer {
  selectedChoiceIds?: string[];
  pbqAnswer?: unknown;
}

const normaliseSingleSelection = (choiceIds: string[]): string | undefined => {
  if (choiceIds.length === 0) {
    return undefined;
  }
  return choiceIds[0];
};

const normaliseMultiSelection = (choiceIds: string[]): Set<string> => {
  return new Set(choiceIds);
};

const arraysEqual = (a: string[], b: string[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((value, index) => value === b[index]);
};

const setsEqual = (a: Set<string>, b: Set<string>): boolean => {
  if (a.size !== b.size) {
    return false;
  }
  for (const value of a) {
    if (!b.has(value)) {
      return false;
    }
  }
  return true;
};

const evaluatePBQOrder = (expected: string[], answer: unknown): GradeOutcome => {
  if (!Array.isArray(expected)) {
    return { isCorrect: false, details: { message: 'PBQ ordering is misconfigured.' } };
  }

  if (!Array.isArray(answer)) {
    return { isCorrect: false, details: { message: 'Answer must be an array matching ordering.' } };
  }

  const normalisedAnswer = answer.map(String);
  const isCorrect = arraysEqual(expected, normalisedAnswer);
  return {
    isCorrect,
    details: {
      expected,
    },
  };
};

const evaluatePBQMatch = (
  expectedPairs: Array<Record<string, string>>,
  answer: unknown,
): GradeOutcome => {
  if (!Array.isArray(expectedPairs)) {
    return { isCorrect: false, details: { message: 'PBQ match configuration invalid.' } };
  }

  if (!Array.isArray(answer)) {
    return { isCorrect: false, details: { message: 'Answer must contain matching pairs.' } };
  }

  const expectedSet = new Set(expectedPairs.map((pair) => JSON.stringify(pair)));
  const answerSet = new Set(answer.map((pair) => JSON.stringify(pair)));

  return {
    isCorrect: setsEqual(expectedSet, answerSet),
    details: { expected: expectedPairs },
  };
};

const evaluatePBQFill = (acceptedAnswers: string[], answer: unknown): GradeOutcome => {
  if (!Array.isArray(acceptedAnswers) || acceptedAnswers.length === 0) {
    return { isCorrect: false, details: { message: 'PBQ fill answers are not configured.' } };
  }

  const normalisedAccepted = acceptedAnswers.map((value) => value.trim().toLowerCase());

  if (typeof answer === 'string') {
    const user = answer.trim().toLowerCase();
    return {
      isCorrect: normalisedAccepted.includes(user),
      details: { expected: acceptedAnswers },
    };
  }

  if (Array.isArray(answer)) {
    const userAnswers = answer.map((value) => String(value).trim().toLowerCase());
    const isCorrect = userAnswers.every((value) => normalisedAccepted.includes(value));
    return {
      isCorrect,
      details: { expected: acceptedAnswers },
    };
  }

  return { isCorrect: false, details: { message: 'PBQ fill answer must be a string or string array.' } };
};

const evaluatePBQGroup = (expectedGroups: Record<string, string[]>, answer: unknown): GradeOutcome => {
  if (!expectedGroups || typeof expectedGroups !== 'object') {
    return { isCorrect: false, details: { message: 'PBQ group configuration invalid.' } };
  }

  if (typeof answer !== 'object' || !answer) {
    return { isCorrect: false, details: { message: 'Answer must be a group mapping.' } };
  }

  const normalisedExpected = new Map(
    Object.entries(expectedGroups).map(([bucket, items]) => [bucket, new Set(items)]),
  );

  for (const [bucket, expectedItems] of normalisedExpected.entries()) {
    const userItems = Array.isArray((answer as Record<string, unknown>)[bucket])
      ? new Set((answer as Record<string, string[]>)[bucket])
      : new Set<string>();

    if (!setsEqual(expectedItems, userItems)) {
      return { isCorrect: false, details: { expected: expectedGroups } };
    }
  }

  return { isCorrect: true, details: { expected: expectedGroups } };
};

export const gradeQuestion = (question: Question, userAnswer: UserAnswer): GradeOutcome => {
  const { selectedChoiceIds = [], pbqAnswer } = userAnswer;

  switch (question.type) {
    case 'mcq_single': {
      const selected = normaliseSingleSelection(selectedChoiceIds);
      const expected = question.correctChoiceIds[0];
      const isCorrect = Boolean(selected && expected && selected === expected);
      return { isCorrect, details: { expected: question.correctChoiceIds } };
    }
    case 'mcq_multi': {
      const expectedChoices = question.correctChoiceIds;
      const expectedSet = normaliseMultiSelection(expectedChoices);
      const userSet = normaliseMultiSelection(selectedChoiceIds);
      return {
        isCorrect: setsEqual(expectedSet, userSet),
        details: { expected: expectedChoices },
      };
    }
    case 'pbq_order': {
      const config = question.pbqSpec.configuration as { ordering?: unknown };
      const ordering = Array.isArray(config.ordering) ? config.ordering.map(String) : [];
      return evaluatePBQOrder(ordering, pbqAnswer);
    }
    case 'pbq_match': {
      const config = question.pbqSpec.configuration as {
        pairs?: Array<Record<string, string>>;
      };
      const pairs = Array.isArray(config.pairs) ? config.pairs : [];
      return evaluatePBQMatch(pairs, pbqAnswer);
    }
    case 'pbq_fill': {
      const config = question.pbqSpec.configuration as { acceptedAnswers?: unknown };
      const accepted = Array.isArray(config.acceptedAnswers)
        ? config.acceptedAnswers.map((value) => String(value))
        : [];
      return evaluatePBQFill(accepted, pbqAnswer);
    }
    case 'pbq_group': {
      const config = question.pbqSpec.configuration as {
        groups?: Record<string, string[]>;
      };
      const groups = config.groups ?? {};
      return evaluatePBQGroup(groups, pbqAnswer);
    }
    default: {
      const exhaustiveCheck: never = question;
      return {
        isCorrect: false,
        details: { message: `Unknown question type ${(exhaustiveCheck as { type?: string }).type ?? 'unknown'}` },
      };
    }
  }
};

export const gradeResponses = (
  questions: Question[],
  responses: Record<string, UserAnswer>,
): { totalCorrect: number; totalQuestions: number; results: Record<string, GradeOutcome> } => {
  const results: Record<string, GradeOutcome> = {};
  for (const question of questions) {
    const response = responses[question.id] ?? {};
    results[question.id] = gradeQuestion(question, response);
  }

  const totalCorrect = Object.values(results).filter((outcome) => outcome.isCorrect).length;
  return {
    totalCorrect,
    totalQuestions: questions.length,
    results,
  };
};
