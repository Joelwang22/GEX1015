const buildOptionLetters = (optionCount: number): string[] => {
  const safeCount = Number.isFinite(optionCount) ? Math.max(0, Math.min(optionCount, 26)) : 0;
  return Array.from({ length: safeCount }, (_, index) => String.fromCharCode(65 + index));
};

const isCorrectAnswerContext = (prefix: string): boolean => /correct answers?\s*:?\s*$/i.test(prefix);

const ensureLeadingEndsWithNewline = (leading: string): string => {
  if (!leading) {
    return '';
  }
  if (leading.includes('\n') || leading.includes('\r')) {
    return leading;
  }
  return leading.replace(/[ \t]+$/, '\n');
};

export const formatExplanationWithOptionLineBreaks = (explanation: string, optionCount: number): string => {
  const trimmed = explanation.trim();
  if (!trimmed) {
    return trimmed;
  }

  const letters = buildOptionLetters(optionCount);
  if (letters.length === 0) {
    return trimmed;
  }

  const letterClass = letters.join('');
  const optionWordRegex = new RegExp(`(^|[.!?:]\\s+)(Option\\s+[${letterClass}])\\b\\s+`, 'gi');
  const letterTokenRegex = new RegExp(`(^|[.!?:]\\s+)(\\([${letterClass}]\\)|[${letterClass}][\\)\\.:])\\s+`, 'gi');

  let optionTokenCount = 0;
  let match: RegExpExecArray | null = null;

  optionWordRegex.lastIndex = 0;
  while ((match = optionWordRegex.exec(trimmed)) !== null) {
    optionTokenCount += 1;
    if (optionTokenCount >= 2) {
      break;
    }
  }

  letterTokenRegex.lastIndex = 0;
  while ((match = letterTokenRegex.exec(trimmed)) !== null) {
    const matchIndex = match.index ?? 0;
    const prefix = trimmed.slice(0, matchIndex).slice(-40);
    if (isCorrectAnswerContext(prefix)) {
      continue;
    }
    optionTokenCount += 1;
    if (optionTokenCount >= 2) {
      break;
    }
  }

  if (optionTokenCount < 2) {
    return trimmed;
  }

  optionWordRegex.lastIndex = 0;
  letterTokenRegex.lastIndex = 0;

  return trimmed
    .replace(optionWordRegex, (_fullMatch, leading, token) => `${ensureLeadingEndsWithNewline(leading)}${token} `)
    .replace(letterTokenRegex, (_fullMatch, leading, token, offset, source) => {
      const prefix = source.slice(0, offset).slice(-40);
      if (isCorrectAnswerContext(prefix)) {
        return `${leading}${token} `;
      }
      return `${ensureLeadingEndsWithNewline(leading)}${token} `;
    })
    .trim();
};
