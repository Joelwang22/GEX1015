'use strict';

/**
 * validate-questions.cjs
 *
 * Checks generated-questions.ts for duplicates against the existing seed.
 *
 * Usage:
 *   node validate-questions.cjs                  ← checks generated-questions.ts
 *   node validate-questions.cjs path/to/file.ts  ← checks any file
 *
 * Exits with code 1 if HIGH-similarity duplicates are found.
 */

const fs = require('fs');
const path = require('path');

const SEED_FILE      = path.join(__dirname, 'src/seed/gex1015.ts');
const DEFAULT_INPUT  = path.join(__dirname, 'generated-questions.ts');

// Similarity thresholds
const THRESHOLD_HIGH = 0.55;  // flag as probable duplicate
const THRESHOLD_WARN = 0.38;  // flag as worth reviewing

// Words that appear in almost every philosophy MCQ stem — not useful for comparison
const STOPWORDS = new Set([
  // English function words
  'a','an','the','is','are','was','were','be','been','being','have','has','had',
  'do','does','did','will','would','could','should','may','might','must','shall',
  'can','in','on','at','to','for','of','with','by','from','as','into','about',
  'and','but','or','nor','so','not','no','just','if','then','than','that','this',
  'these','those','each','every','all','any','few','more','most','other','some',
  'such','only','same','own','also','even','though','although','while','when',
  'where','which','what','who','how','there','here','it','its','he','his','she',
  'her','they','their','we','our','you','your','i','my','me','him','them','us',
  // Very common in MCQ stems — don't discriminate
  'true','false','following','according','correct','best','describes','description',
  'statement','action','person','people','one','two','three','four','five','six',
  'select','all','apply','choose','option','options','answer','answers','above',
  'below','none','both','either','neither','always','never','often','sometimes',
  'given','suppose','assume','consider','think','say','says','said','claim',
  'claims','think','thinks','argue','argues','would','correctly','most','least',
  'accurately','represents','true','false','possible','impossible','necessary',
  'whether','case','cases','following','example','examples',
]);

// ─── Parsing ──────────────────────────────────────────────────────────────────

/** Extract { id, stem, topicIds } objects from a TypeScript source string. */
function extractQuestions(src) {
  const questions = [];

  // Match id field
  const idRe = /id:\s*'(gex-\d+)'/g;
  // Match stem field (single-line, single-quoted)
  const stemRe = /stem:\s*'((?:[^'\\]|\\.)*)'/g;
  // Match topicIds field
  const topicRe = /topicIds:\s*\[([^\]]+)\]/g;

  const ids     = [...src.matchAll(idRe)].map(m => m[1]);
  const stems   = [...src.matchAll(stemRe)].map(m => m[1].replace(/\\'/g, "'"));
  const topics  = [...src.matchAll(topicRe)].map(m =>
    m[1].replace(/['\s]/g, '').split(',').filter(Boolean)
  );

  const len = Math.min(ids.length, stems.length);
  for (let i = 0; i < len; i++) {
    questions.push({ id: ids[i], stem: stems[i], topicIds: topics[i] ?? [] });
  }
  return questions;
}

// ─── Similarity ───────────────────────────────────────────────────────────────

function tokenize(text) {
  return new Set(
    text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOPWORDS.has(w))
  );
}

/** Jaccard similarity between two word sets. */
function jaccard(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const w of setA) if (setB.has(w)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Normalise a stem for exact-match comparison. */
function normalise(stem) {
  return stem.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

// ─── Reporting helpers ────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';

function bar(score) {
  const filled = Math.round(score * 20);
  return '[' + '█'.repeat(filled) + '░'.repeat(20 - filled) + ']';
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const inputFile = process.argv[2] ?? DEFAULT_INPUT;

  if (!fs.existsSync(inputFile)) {
    console.error(`❌  File not found: ${inputFile}`);
    console.error('    Run the generator first: npm run agent week2 5');
    process.exit(1);
  }
  if (!fs.existsSync(SEED_FILE)) {
    console.error(`❌  Seed file not found: ${SEED_FILE}`);
    process.exit(1);
  }

  const existingSrc   = fs.readFileSync(SEED_FILE, 'utf-8');
  const generatedSrc  = fs.readFileSync(inputFile, 'utf-8');

  const existing   = extractQuestions(existingSrc);
  const generated  = extractQuestions(generatedSrc);

  if (generated.length === 0) {
    console.error('❌  No questions found in generated file. Check the format.');
    process.exit(1);
  }

  console.log(`\n${BOLD}GEX1015 Question Validator${RESET}`);
  console.log(`${DIM}Seed: ${existing.length} existing questions`);
  console.log(`Input: ${generated.length} generated questions${RESET}\n`);

  // Pre-tokenise existing questions
  const existingTokens = existing.map(q => ({
    ...q,
    tokens: tokenize(q.stem),
    norm: normalise(q.stem),
  }));

  let highCount = 0;
  let warnCount = 0;
  let passCount = 0;
  const highFlags = [];
  const warnFlags = [];

  for (const gen of generated) {
    const genTokens = tokenize(gen.stem);
    const genNorm   = normalise(gen.stem);

    let topMatch = null;
    let topScore = 0;

    for (const ex of existingTokens) {
      // Exact normalised match
      if (genNorm === ex.norm) {
        topMatch = ex;
        topScore = 1.0;
        break;
      }
      const score = jaccard(genTokens, ex.tokens);
      if (score > topScore) {
        topScore = score;
        topMatch = ex;
      }
    }

    if (topScore >= THRESHOLD_HIGH) {
      highCount++;
      highFlags.push({ gen, match: topMatch, score: topScore });
    } else if (topScore >= THRESHOLD_WARN) {
      warnCount++;
      warnFlags.push({ gen, match: topMatch, score: topScore });
    } else {
      passCount++;
    }
  }

  // ── Print HIGH flags ──────────────────────────────────────────────────────
  if (highFlags.length > 0) {
    console.log(`${RED}${BOLD}🚫  HIGH SIMILARITY — probable duplicates (${highFlags.length})${RESET}`);
    console.log(`${DIM}These closely match existing questions. Consider removing them.${RESET}\n`);
    for (const { gen, match, score } of highFlags) {
      console.log(`  ${RED}${BOLD}${gen.id}${RESET}  ${bar(score)} ${(score * 100).toFixed(0)}%`);
      console.log(`  ${RED}NEW:${RESET}      "${gen.stem.substring(0, 100)}${gen.stem.length > 100 ? '…' : ''}"`);
      console.log(`  ${DIM}EXISTING: [${match.id}] "${match.stem.substring(0, 100)}${match.stem.length > 100 ? '…' : ''}"${RESET}\n`);
    }
  }

  // ── Print WARN flags ──────────────────────────────────────────────────────
  if (warnFlags.length > 0) {
    console.log(`${YELLOW}${BOLD}⚠️   REVIEW RECOMMENDED — possible overlap (${warnFlags.length})${RESET}`);
    console.log(`${DIM}May test the same concept from a different angle. Human judgment needed.${RESET}\n`);
    for (const { gen, match, score } of warnFlags) {
      console.log(`  ${YELLOW}${BOLD}${gen.id}${RESET}  ${bar(score)} ${(score * 100).toFixed(0)}%`);
      console.log(`  ${YELLOW}NEW:${RESET}      "${gen.stem.substring(0, 100)}${gen.stem.length > 100 ? '…' : ''}"`);
      console.log(`  ${DIM}EXISTING: [${match.id}] "${match.stem.substring(0, 100)}${match.stem.length > 100 ? '…' : ''}"${RESET}\n`);
    }
  }

  // ── Print PASS ────────────────────────────────────────────────────────────
  if (passCount > 0) {
    const passQuestions = generated.filter(gen => {
      const genTokens = tokenize(gen.stem);
      const genNorm = normalise(gen.stem);
      for (const ex of existingTokens) {
        if (genNorm === ex.norm) return false;
        if (jaccard(genTokens, ex.tokens) >= THRESHOLD_WARN) return false;
      }
      return true;
    });
    console.log(`${GREEN}${BOLD}✅  CLEAN — no significant overlap (${passCount})${RESET}`);
    for (const q of passQuestions) {
      console.log(`  ${GREEN}${q.id}${RESET}  "${q.stem.substring(0, 90)}${q.stem.length > 90 ? '…' : ''}"`);
    }
    console.log();
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('─'.repeat(60));
  console.log(`${BOLD}Summary:${RESET}`);
  console.log(`  ${GREEN}✅ Clean:${RESET}          ${passCount}`);
  console.log(`  ${YELLOW}⚠️  Review needed:${RESET}  ${warnCount}`);
  console.log(`  ${RED}🚫 Likely duplicate:${RESET} ${highCount}`);
  console.log();

  if (highCount > 0) {
    console.log(`${RED}Action required: remove or rephrase the ${highCount} HIGH-similarity question(s) above.${RESET}`);
    process.exit(1);
  } else if (warnCount > 0) {
    console.log(`${YELLOW}Review the ${warnCount} flagged question(s) before committing.${RESET}`);
    console.log(`If they test a meaningfully different angle, they're fine to keep.`);
    process.exit(0);
  } else {
    console.log(`${GREEN}All generated questions look unique. Safe to paste into gex1015.ts.${RESET}`);
    process.exit(0);
  }
}

main();
