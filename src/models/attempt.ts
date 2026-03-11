export interface Attempt {
  id: string;
  questionId: string;
  testId?: string;
  submittedAt: string;
  isCorrect: boolean;
  chosenChoiceIds?: string[];
  pbqAnswer?: unknown;
  subjectId: string;
  topicIds: string[];
}
