import type { QuestionType } from './question';

export type TestStatus = 'in_progress' | 'completed';

export interface SelectionPolicy {
  source: 'all' | 'unseen' | 'not_mastered';
  types: QuestionType[];
}

export interface TestAttemptAnswer {
  questionId: string;
  chosenChoiceIds?: string[];
  pbqAnswer?: unknown;
  isCorrect?: boolean;
  submittedAt?: string;
}

export interface Test {
  id: string;
  status: TestStatus;
  subjectIds: string[];
  topicIds: string[];
  selectionPolicy: SelectionPolicy;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, TestAttemptAnswer>;
  markedForReview: string[];
  timeSpentMs?: number;
  score?: number;
  createdAt: string;
  completedAt?: string;
  timeRemainingMs?: number;
}
