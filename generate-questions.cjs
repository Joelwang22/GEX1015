/**
 * generate-questions.cjs
 *
 * Generates new MCQ questions for GEX1015 using the Claude API.
 *
 * Usage:
 *   node generate-questions.cjs <week> [count]
 *
 * Examples:
 *   node generate-questions.cjs week2         → 5 questions for Week 2
 *   node generate-questions.cjs week4 8       → 8 questions for Week 4
 *   node generate-questions.cjs all 5         → 5 questions per week (all weeks)
 *
 * Output is written to: generated-questions.ts  (ready to review & paste)
 *
 * Requirements:
 *   ANTHROPIC_API_KEY environment variable must be set.
 */

'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// ─── Configuration ────────────────────────────────────────────────────────────

const SEED_FILE   = path.join(__dirname, 'src/seed/gex1015.ts');
const OUTPUT_FILE = path.join(__dirname, 'generated-questions.ts');

const TOPICS = {
  week1: {
    dir: 'midterm prep',
    topicId: 'gex-intro',
    label: 'Week 1: Introduction to Philosophy',
    files: [
      'LUE 2026 Week 1 Introduction student version.txt',
      'transcripts/Week1 transcript.txt',
    ],
  },
  week2: {
    dir: 'midterm prep',
    topicId: 'gex-goodness',
    label: 'Week 2: Goodness (Hedonism, Desire Theory, Objective List)',
    files: [
      'LUE 2026 Week 2 Goodness student version.txt',
      'Week 2 Nozick The Experience Machine.txt',
    ],
  },
  week3: {
    dir: 'midterm prep',
    topicId: 'gex-right-wrong-1',
    label: 'Week 3: Right & Wrong I (Consequentialism, Utilitarianism, Singer)',
    files: [
      'LUE 2026 Week 3 Right and Wrong1 student version.txt',
      'Week 3 Singer Famine, Affluence, and Morality.txt',
      'transcripts/Week3 transcript.txt',
    ],
  },
  week4: {
    dir: 'midterm prep',
    topicId: 'gex-right-wrong-2',
    label: 'Week 4: Right & Wrong II (Non-Consequentialism, Kant, Trolley, Thomson)',
    files: [
      'LUE 2026 Week4 Right and Wrong2 Non-consequentialism student version.txt',
      'Week 4 Thomson Turning the Trolley.txt',
      'transcripts/Week4 transcript.txt',
    ],
  },
  week5: {
    dir: 'midterm prep',
    topicId: 'gex-logic-relativism',
    label: 'Week 5: Logical Reasoning & Cultural Relativism',
    files: [
      'LUE 2026 Week5 Relativism & Logical Reasoning student version.txt',
      'Week 5 Rachels The Challenge of Cultural Relativism.txt',
      'transcripts/Week5 transcript.txt',
    ],
  },
  week6: {
    dir: 'midterm prep',
    topicId: 'gex-religion',
    label: 'Week 6: Religion & The Problem of Evil',
    files: [
      'LUE 2026 Week6 Religion student version.txt',
      'Week 6 Perry Dialogue on Good, Evil and the Existence of God.txt',
      'transcripts/Week6 transcript.txt',
    ],
  },
  week8: {
    dir: 'finals prep',
    topicId: 'gex-free-will',
    label: 'Week 8: Free Will and Moral Responsibility',
    files: [
      'LUE 2026 Week8 Free Will student version.txt',
      'Week 8 Do We Possess Free Will.txt',
    ],
  },
  week9: {
    dir: 'finals prep',
    topicId: 'gex-ai-consciousness',
    label: 'Week 9: AI Consciousness, Chinese Room, and Isomorphs',
    files: [
      'LUE 2026 Week9 AI Consciousness student version.txt',
      'Week 9 Schneider The Problem of AI Consciousness.txt',
    ],
  },
  week12: {
    dir: 'finals prep',
    topicId: 'gex-art',
    label: 'Week 12: Art, Definitions, and Levinson',
    files: [
      'LUE 2026 Week12 Art student version.txt',
    ],
  },
  week13: {
    dir: 'finals prep',
    topicId: 'gex-death',
    label: 'Week 13: Death and Nagel',
    files: [
      'LUE 2026 Week13 Death student version.txt',
      'Week 13 Reading Nagel Death.txt',
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8').trim();
  } catch {
    return null;
  }
}

/** Load all source content for a given week config. */
function loadContent(weekConfig) {
  const contentDir = path.join(__dirname, weekConfig.dir ?? 'midterm prep');
  const parts = [];
  for (const file of weekConfig.files) {
    const full = path.join(contentDir, file);
    const text = readFile(full);
    if (text) {
      parts.push(`=== ${file} ===\n${text}`);
    } else {
      console.warn(`  ⚠  Could not read: ${file}`);
    }
  }
  return parts.join('\n\n');
}

/** Extract existing questions for a topic from the seed file. */
function loadExistingQuestions(topicId) {
  const seed = readFile(SEED_FILE) || '';
  // Find blocks containing this topicId
  const regex = /\{\n\s+id: '(gex-\d+)'[\s\S]*?\},(?=\n\s+[/{])/g;
  const matches = [];
  let m;
  while ((m = regex.exec(seed)) !== null) {
    if (m[0].includes(`'${topicId}'`)) {
      // Extract just the stem for dedup purposes
      const stemMatch = m[0].match(/stem: '([^']+)'/);
      if (stemMatch) matches.push(stemMatch[1].substring(0, 80));
    }
  }
  return matches;
}

/** Get the next available question number. */
function nextQuestionNumber() {
  const seed = readFile(SEED_FILE) || '';
  const ids = [...seed.matchAll(/id: 'gex-(\d+)'/g)].map(m => parseInt(m[1]));
  return ids.length > 0 ? Math.max(...ids) + 1 : 92;
}

// ─── Prompt Construction ───────────────────────────────────────────────────────

function buildPrompt(weekConfig, content, existingStems, count, startId) {
  const existingList = existingStems.length > 0
    ? `\nEXISTING QUESTIONS (do NOT duplicate these topics):\n${existingStems.map((s, i) => `${i + 1}. ${s}...`).join('\n')}\n`
    : '';

  return `You are generating MCQ exam questions for a NUS undergraduate philosophy course: GEX1015 "Life, the Universe, and Everything".

TOPIC: ${weekConfig.label}
TOPIC ID: ${weekConfig.topicId}
START ID: gex-${String(startId).padStart(3, '0')}

SOURCE MATERIAL (lecture slides, transcripts, readings):
${content.substring(0, 60000)}
${existingList}

TASK: Generate exactly ${count} new multiple-choice questions based on this content.

REQUIREMENTS:
1. Questions must be directly based on the source material — no invented content
2. Each question must have exactly 4 choices (ids: a, b, c, d)
3. Include at least one mcq_multi (multiple correct answers) among the ${count} questions
4. Vary difficulty: some easy (difficulty: 1), some medium (2), some hard (3)
5. The explanation must clearly explain WHY the correct answer is right AND why wrong answers are wrong
6. Questions should test understanding, not just recall — include scenario-based and apply-the-theory questions
7. Do NOT duplicate any of the existing question stems listed above

OUTPUT FORMAT: Output ONLY valid TypeScript array entries (no import/export, no wrapping array, no extra text). Use this EXACT format:

  {
    id: 'gex-${String(startId).padStart(3, '0')}',
    subjectId,
    topicIds: ['${weekConfig.topicId}'],
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

For mcq_multi questions, use type: 'mcq_multi' and list all correct ids in correctChoiceIds.

Generate questions gex-${String(startId).padStart(3, '0')} through gex-${String(startId + count - 1).padStart(3, '0')}.`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function generateForWeek(client, weekKey, count, startId) {
  const weekConfig = TOPICS[weekKey];
  console.log(`\n📚 Generating ${count} questions for ${weekConfig.label}...`);

  console.log('  Loading content...');
  const content = loadContent(weekConfig);
  if (!content) {
    console.error('  ❌ No content loaded. Skipping.');
    return { output: '', nextId: startId };
  }

  const existingStems = loadExistingQuestions(weekConfig.topicId);
  console.log(`  Found ${existingStems.length} existing questions for this topic.`);

  const prompt = buildPrompt(weekConfig, content, existingStems, count, startId);

  console.log('  Calling Claude API (streaming)...');
  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    messages: [{ role: 'user', content: prompt }],
  });

  let output = '';
  process.stdout.write('  ');
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      output += event.delta.text;
      process.stdout.write('.');
    }
  }
  process.stdout.write('\n');

  const finalMessage = await stream.finalMessage();
  console.log(`  ✓ Done. Tokens used: ${finalMessage.usage.input_tokens} in / ${finalMessage.usage.output_tokens} out`);

  return { output: output.trim(), nextId: startId + count };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node generate-questions.cjs <week|all> [count]');
    console.log('  week: week1 | week2 | week3 | week4 | week5 | week6 | week8 | week9 | week12 | week13 | all');
    console.log('  count: number of questions to generate (default: 5)');
    process.exit(1);
  }

  const weekArg = args[0].toLowerCase();
  const count = parseInt(args[1] || '5', 10);

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('❌ ANTHROPIC_API_KEY environment variable is not set.');
    process.exit(1);
  }

  const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

  let startId = nextQuestionNumber();
  const sections = [];

  const weeks = weekArg === 'all' ? Object.keys(TOPICS) : [weekArg];

  for (const weekKey of weeks) {
    if (!TOPICS[weekKey]) {
      console.error(`❌ Unknown week: ${weekKey}. Choose from: ${Object.keys(TOPICS).join(', ')}, all`);
      process.exit(1);
    }
    const { output, nextId } = await generateForWeek(client, weekKey, count, startId);
    if (output) {
      sections.push(`  // ─── ${TOPICS[weekKey].label} ───\n${output}`);
      startId = nextId;
    }
  }

  const fileContent = `// Generated questions — review carefully before pasting into src/seed/gex1015.ts
// Insert these entries inside the questions array, before the closing ];
// Make sure 'subjectId' and 'now' are in scope (they are in gex1015.ts).

${sections.join('\n\n')}
`;

  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');

  console.log(`\n✅ Generated questions written to: ${path.basename(OUTPUT_FILE)}`);
  console.log('   Review the file, then paste the entries into src/seed/gex1015.ts');
  console.log('   Remember to run: npm run build  (to verify TypeScript compiles)');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
