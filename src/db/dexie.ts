import Dexie, { type Table } from 'dexie';
import type {
  AppConfig,
  Attempt,
  Question,
  Subject,
  Test,
  Topic,
  UserState,
} from '../models';
import { gex1015Seed } from '../seed/gex1015';

export const DEFAULT_MASTERY_THRESHOLD = 3;
export const DEFAULT_TEST_DURATION_MINUTES = 30;

type QuestionDifficulty = 1 | 2 | 3 | 4 | 5;
const DEFAULT_DIFFICULTY: QuestionDifficulty = 3;

export class GEX1015DB extends Dexie {
  subjects!: Table<Subject, string>;
  topics!: Table<Topic, string>;
  questions!: Table<Question, string>;
  tests!: Table<Test, string>;
  attempts!: Table<Attempt, string>;
  userState!: Table<UserState, string>;
  config!: Table<AppConfig, string>;

  constructor() {
    super('GEX1015DB');

    const schema = {
      subjects: 'id',
      topics: 'id, subjectId',
      questions: 'id, subjectId, *topicIds, type, difficulty',
      tests: 'id, status, [subjectIds+status]',
      attempts: 'id, questionId, testId, subjectId, *topicIds, isCorrect',
      userState: 'id',
      config: 'id',
    } as const;

    this.version(1).stores(schema);

    this.version(2).stores(schema).upgrade(async (tx) => {
      await tx.table<Subject, string>('subjects').bulkPut(gex1015Seed.subjects);
      await tx.table<Topic, string>('topics').bulkPut(gex1015Seed.topics);
      await tx.table<Question, string>('questions').bulkPut(
        gex1015Seed.questions.map((q) => ({
          ...q,
          difficulty: q.difficulty ?? DEFAULT_DIFFICULTY,
        })),
      );
    });

    this.on('populate', async () => {
      await this.populateFromSeed();
    });

    this.on('ready', async () => {
      await this.syncSeedData();
    });
  }

  private async populateFromSeed(): Promise<void> {
    await this.ensureSeedData();

    await this.transaction('rw', this.userState, this.config, async () => {
      await this.userState.put({ id: 'singleton' });
      await this.config.put({
        id: 'settings',
        masteryThreshold: DEFAULT_MASTERY_THRESHOLD,
        timerEnabled: false,
      });
    });
  }

  private async syncSeedData(): Promise<void> {
    await this.transaction('rw', this.subjects, this.topics, this.questions, async () => {
      await this.subjects.bulkPut(gex1015Seed.subjects);
      await this.topics.bulkPut(gex1015Seed.topics);
      await this.questions.bulkPut(
        gex1015Seed.questions.map((q) => ({
          ...q,
          difficulty: q.difficulty ?? DEFAULT_DIFFICULTY,
        })),
      );
    });
  }

  async ensureSeedData(): Promise<void> {
    if (!this.isOpen()) {
      await this.open();
    }
    await this.syncSeedData();
  }
}

export const db = new GEX1015DB();

void db.open().catch((error) => {
  console.error('Failed to open GEX1015DB', error);
});

export const resetDatabase = async (): Promise<void> => {
  await db.delete();
  await db.open();
};
