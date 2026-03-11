export type QuestionType =
  | 'mcq_single'
  | 'mcq_multi'
  | 'pbq_order'
  | 'pbq_match'
  | 'pbq_fill'
  | 'pbq_group';

export type QuestionDifficulty = 1 | 2 | 3 | 4 | 5;

export interface Choice {
  id: string;
  text: string;
}

export interface PBQSpec {
  instructions: string;
  configuration: Record<string, unknown>;
}

export interface QuestionBase {
  id: string;
  subjectId: string;
  topicIds: string[];
  stem: string;
  explanation?: string;
  difficulty?: QuestionDifficulty;
  createdAt?: string;
  updatedAt?: string;
}

export interface MCQQuestion extends QuestionBase {
  type: 'mcq_single' | 'mcq_multi';
  choices: Choice[];
  correctChoiceIds: string[];
}

export interface PBQQuestion extends QuestionBase {
  type: 'pbq_order' | 'pbq_match' | 'pbq_fill' | 'pbq_group';
  pbqSpec: PBQSpec;
}

export type Question = MCQQuestion | PBQQuestion;

export type MCQQuestionUpsert = Omit<MCQQuestion, 'id'> & { id?: string };
export type PBQQuestionUpsert = Omit<PBQQuestion, 'id'> & { id?: string };
export type QuestionUpsert = MCQQuestionUpsert | PBQQuestionUpsert;

export const isMCQ = (
  q: Question | QuestionUpsert,
): q is MCQQuestion | MCQQuestionUpsert => q.type === 'mcq_single' || q.type === 'mcq_multi';

export const isPBQ = (
  q: Question | QuestionUpsert,
): q is PBQQuestion | PBQQuestionUpsert =>
  q.type === 'pbq_order' || q.type === 'pbq_match' || q.type === 'pbq_fill' || q.type === 'pbq_group';
