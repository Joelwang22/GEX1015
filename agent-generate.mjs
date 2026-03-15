/**
 * agent-generate.mjs
 *
 * Uses the Claude Agent SDK to generate new MCQ questions for GEX1015.
 * The agent reads the source material and existing questions itself,
 * then writes the output to generated-questions.ts.
 *
 * Usage:
 *   node agent-generate.mjs <week> [count]
 *
 * Examples:
 *   node agent-generate.mjs week3        → 5 questions for Week 3
 *   node agent-generate.mjs week5 8      → 8 questions for Week 5
 *   node agent-generate.mjs all 4        → 4 questions per week
 *
 * Requires: ANTHROPIC_API_KEY environment variable
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Topic map ────────────────────────────────────────────────────────────────

const TOPICS = {
  week1: {
    topicId: 'gex-intro',
    label: 'Week 1: Introduction to Philosophy',
    files: [
      'midterm prep/LUE 2026 Week 1 Introduction student version.txt',
      'midterm prep/transcripts/Week1 transcript.txt',
    ],
  },
  week2: {
    topicId: 'gex-goodness',
    label: 'Week 2: Goodness (Hedonism, Desire Theory, Objective List)',
    files: [
      'midterm prep/LUE 2026 Week 2 Goodness student version.txt',
      'midterm prep/Week 2 Nozick The Experience Machine.txt',
    ],
  },
  week3: {
    topicId: 'gex-right-wrong-1',
    label: 'Week 3: Right & Wrong I (Consequentialism, Utilitarianism, Singer)',
    files: [
      'midterm prep/LUE 2026 Week 3 Right and Wrong1 student version.txt',
      'midterm prep/Week 3 Singer Famine, Affluence, and Morality.txt',
      'midterm prep/transcripts/Week3 transcript.txt',
    ],
  },
  week4: {
    topicId: 'gex-right-wrong-2',
    label: 'Week 4: Right & Wrong II (Non-Consequentialism, Kant, Trolley, Thomson)',
    files: [
      'midterm prep/LUE 2026 Week4 Right and Wrong2 Non-consequentialism student version.txt',
      'midterm prep/Week 4 Thomson Turning the Trolley.txt',
      'midterm prep/transcripts/Week4 transcript.txt',
    ],
  },
  week5: {
    topicId: 'gex-logic-relativism',
    label: 'Week 5: Logical Reasoning & Cultural Relativism',
    files: [
      'midterm prep/LUE 2026 Week5 Relativism & Logical Reasoning student version.txt',
      'midterm prep/Week 5 Rachels The Challenge of Cultural Relativism.txt',
      'midterm prep/transcripts/Week5 transcript.txt',
    ],
  },
  week6: {
    topicId: 'gex-religion',
    label: 'Week 6: Religion & The Problem of Evil',
    files: [
      'midterm prep/LUE 2026 Week6 Religion student version.txt',
      'midterm prep/Week 6 Perry Dialogue on Good, Evil and the Existence of God.txt',
      'midterm prep/transcripts/Week6 transcript.txt',
    ],
  },
};

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(weeks, count) {
  const weekDescriptions = weeks.map(w => {
    const t = TOPICS[w];
    return `- **${w}** (topicId: \`${t.topicId}\`) — ${t.label}\n  Source files:\n${t.files.map(f => `    • ${f}`).join('\n')}`;
  }).join('\n');

  return `You are generating exam-quality MCQ questions for GEX1015 "Life, the Universe, and Everything" (NUS philosophy course).

## Your task

Generate **${count} new questions per week** for the following week(s):
${weekDescriptions}

## Steps to follow

1. **Read \`src/seed/gex1015.ts\`** to:
   - Find the highest existing question ID (e.g. gex-091) so you can number new ones correctly
   - Scan existing questions for each topicId to avoid duplicating topics already covered

2. **Read the source files** listed above for each week (lecture slides .txt, readings .txt, transcripts .txt)

3. **Generate ${count} questions per week** following these rules:
   - Questions must be directly grounded in the source material
   - Each question has exactly 4 choices (ids: a, b, c, d)
   - Include at least one \`mcq_multi\` (multiple correct answers) per week
   - Vary difficulty: mix of 1 (easy), 2 (medium), 3 (hard)
   - Explanations must state clearly why the correct answer is right AND why wrong answers are wrong
   - Favour scenario/apply-the-theory questions over pure recall
   - Do NOT duplicate questions already in the seed file

4. **Write the output to \`generated-questions.ts\`** (overwrite if it exists) using this exact format:

\`\`\`typescript
// Generated questions — review carefully before pasting into src/seed/gex1015.ts
// Insert these entries inside the questions array, before the closing ];
// 'subjectId' and 'now' are already declared in gex1015.ts — do not redeclare them.

  {
    id: 'gex-092',
    subjectId,
    topicIds: ['gex-goodness'],
    type: 'mcq_single',
    stem: 'Question text here?',
    choices: [
      { id: 'a', text: 'Choice A' },
      { id: 'b', text: 'Choice B' },
      { id: 'c', text: 'Choice C' },
      { id: 'd', text: 'Choice D' },
    ],
    correctChoiceIds: ['b'],
    explanation: 'Explanation here.',
    difficulty: 2,
    createdAt: now,
    updatedAt: now,
  },
\`\`\`

5. After writing the file, **report a summary**: how many questions were generated per week, the ID range used, and any notable topics covered.`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node agent-generate.mjs <week|all> [count]');
    console.log('  week:  week1 | week2 | week3 | week4 | week5 | week6 | all');
    console.log('  count: questions per week (default: 5)');
    process.exit(1);
  }

  const weekArg = args[0].toLowerCase();
  const count = parseInt(args[1] || '5', 10);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌  ANTHROPIC_API_KEY environment variable is not set.');
    process.exit(1);
  }

  const weeks = weekArg === 'all' ? Object.keys(TOPICS) : [weekArg];
  for (const w of weeks) {
    if (!TOPICS[w]) {
      console.error(`❌  Unknown week: "${w}". Valid: ${Object.keys(TOPICS).join(', ')}, all`);
      process.exit(1);
    }
  }

  console.log(`\n🤖 Starting agent — generating ${count} question(s) for: ${weeks.join(', ')}\n`);

  const prompt = buildPrompt(weeks, count);

  for await (const message of query({
    prompt,
    options: {
      cwd: __dirname,
      allowedTools: ['Read', 'Write', 'Glob', 'Grep'],
      permissionMode: 'acceptEdits',
      maxTurns: 20,
    },
  })) {
    // Print assistant text as it arrives
    if (message.type === 'assistant') {
      for (const block of message.message?.content ?? []) {
        if (block.type === 'text' && block.text) {
          process.stdout.write(block.text);
        }
      }
    }

    // Final result
    if ('result' in message) {
      console.log('\n\n─────────────────────────────────────────');
      console.log('✅  Agent finished.');
      console.log('📄  Review generated-questions.ts, then paste into src/seed/gex1015.ts');
      console.log('🔨  Run: npm run build   (to verify TypeScript compiles)');
    }
  }
}

main().catch(err => {
  console.error('\n❌  Agent error:', err.message);
  process.exit(1);
});
