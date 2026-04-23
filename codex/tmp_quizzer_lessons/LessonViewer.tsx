import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  SECURITY_PLUS_LESSONS,
  markLessonDone,
  type LessonSlide,
  type IntroSlide,
  type ConceptSlide,
  type BulletsSlide,
  type QuoteSlide,
  type TermSlide,
  type CheckSlide,
  type SummarySlide,
} from '../data/securityPlusLessons';

const baseSlidePanelClass = 'min-h-full rounded-2xl border border-slate-700 bg-slate-900/60';

const clampSlideIndex = (value: number, total: number): number => {
  if (!Number.isFinite(value) || total <= 0) {
    return 0;
  }

  return Math.min(Math.max(Math.trunc(value), 0), total - 1);
};

type CheckSlideMode = 'binary' | 'fill_blank' | 'multiple_choice' | 'multi_part' | 'case' | 'reflection';

interface CheckSlidePresentation {
  mode: CheckSlideMode;
  eyebrow: string;
  title: string;
  description: string;
  accentClass: string;
  buttonClass: string;
}

interface ChoiceOption {
  key: string;
  label: string;
}

interface FillBlankData {
  prompt: string;
  blankCount: number;
  options: ChoiceOption[];
  correctKeys: string[];
}

const extractChoiceOptions = (question: string): ChoiceOption[] => {
  if (/Options:/i.test(question)) {
    const optionsSection = question.split(/Options:/i)[1] ?? '';
    const matches = Array.from(optionsSection.matchAll(/\(([A-Za-z])\)\s*([^()]+?)(?=\s*\([A-Za-z]\)|$)/g));
    return matches.map((match) => ({
      key: (match[1] ?? '').toUpperCase(),
      label: (match[2] ?? '').trim(),
    }));
  }

  const inlineMatches = Array.from(question.matchAll(/\(([A-Za-z])\)\s*([^()]+?)(?=\s*\([A-Za-z]\)|$)/g));
  if (inlineMatches.length >= 2) {
    return inlineMatches.map((match) => ({
      key: (match[1] ?? '').toUpperCase(),
      label: (match[2] ?? '').trim(),
    }));
  }

  const sentenceMatches = Array.from(question.matchAll(/([A-Z])\.\s*([^A-Z][^]*?)(?=\s+[A-Z]\.\s|$)/g));
  if (sentenceMatches.length >= 2) {
    return sentenceMatches.map((match) => ({
      key: match[1] ?? '',
      label: (match[2] ?? '').trim(),
    }));
  }

  return [];
};

const isMultiPartPrompt = (question: string, options: ChoiceOption[]): boolean => {
  if (/for each|each of the four combinations|work through|sub-question|part \w+/i.test(question)) {
    return true;
  }

  if (options.length < 2) {
    return false;
  }

  const questionLikeOptions = options.filter((option) =>
    /[?]$/.test(option.label) ||
    /^(are|is|what|why|how|which|can|could|does|do|did|suppose|give|identify|select)\b/i.test(option.label),
  );

  return questionLikeOptions.length === options.length;
};

const getCheckSlidePresentation = (question: string): CheckSlidePresentation => {
  const choiceOptions = extractChoiceOptions(question);

  if (/true or false/i.test(question)) {
    return {
      mode: 'binary',
      eyebrow: 'Decision Point',
      title: 'True or false',
      description: 'Commit to a verdict before revealing the explanation.',
      accentClass: 'text-amber-300',
      buttonClass: 'border-amber-500/60 text-amber-200 hover:bg-amber-500/10',
    };
  }

  if (/fill in the blank|\[____\]/i.test(question)) {
    return {
      mode: 'fill_blank',
      eyebrow: 'Recall Prompt',
      title: 'Fill in the blank',
      description: 'Try to supply the missing term or relationship before checking the answer.',
      accentClass: 'text-cyan-300',
      buttonClass: 'border-cyan-500/60 text-cyan-200 hover:bg-cyan-500/10',
    };
  }

  if (choiceOptions.length > 0 && !isMultiPartPrompt(question, choiceOptions)) {
    return {
      mode: 'multiple_choice',
      eyebrow: 'Choose One',
      title: 'Multiple choice',
      description: 'Pick the best answer before opening the explanation.',
      accentClass: 'text-sky-300',
      buttonClass: 'border-sky-500/60 text-sky-200 hover:bg-sky-500/10',
    };
  }

  if (isMultiPartPrompt(question, choiceOptions)) {
    return {
      mode: 'multi_part',
      eyebrow: 'Break It Down',
      title: 'Work through the parts',
      description: 'Handle each part in order, then compare with the explanation.',
      accentClass: 'text-fuchsia-300',
      buttonClass: 'border-fuchsia-500/60 text-fuchsia-200 hover:bg-fuchsia-500/10',
    };
  }

  if (/suppose|assume|case|scenario|which phase|next action/i.test(question)) {
    return {
      mode: 'case',
      eyebrow: 'Case Analysis',
      title: 'Apply the concept',
      description: 'Treat this like an exam scenario and decide which distinction controls the answer.',
      accentClass: 'text-teal-300',
      buttonClass: 'border-teal-500/60 text-teal-200 hover:bg-teal-500/10',
    };
  }

  return {
    mode: 'reflection',
    eyebrow: 'Quick Reflection',
    title: 'Test your understanding',
    description: 'Pause, answer it in your own words, then open the explanation.',
    accentClass: 'text-violet-300',
    buttonClass: 'border-violet-500/60 text-violet-200 hover:bg-violet-500/10',
  };
};

const extractPartLabels = (question: string): string[] => {
  const matches = question.match(/\(([a-z])\)/gi) ?? [];
  return Array.from(new Set(matches.map((match) => `Part ${match.replace(/[()]/g, '').toUpperCase()}`)));
};

const extractFillBlankData = (question: string, answerHtml: string): FillBlankData | null => {
  if (!/fill in the blank|\[____\]/i.test(question)) {
    return null;
  }

  const prompt = question.split(/Options:/i)[0]?.trim() ?? question.trim();
  const blankCount = Math.max((prompt.match(/\[____\]/g) ?? []).length, 1);
  const options = extractChoiceOptions(question);
  const correctMatches = Array.from(answerHtml.matchAll(/\(([A-Z])\)/g)).map((match) => match[1] ?? '');
  const correctKeys = correctMatches.slice(0, blankCount);

  return {
    prompt,
    blankCount,
    options,
    correctKeys,
  };
};

const renderFillBlankPrompt = (
  prompt: string,
  assignedKeys: Array<string | null>,
  optionsByKey: Map<string, ChoiceOption>,
  onDropOption: (blankIndex: number, optionKey: string) => void,
  onClearBlank: (blankIndex: number) => void,
): JSX.Element => {
  const parts = prompt.split('[____]');

  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-3 text-base leading-relaxed text-slate-100">
      {parts.map((part, index) => (
        <span key={`segment-${index}`} className="contents">
          {part ? <span>{part}</span> : null}
          {index < parts.length - 1 ? (
            <button
              type="button"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const optionKey = event.dataTransfer.getData('text/plain');
                if (optionKey) {
                  onDropOption(index, optionKey);
                }
              }}
              onClick={() => onClearBlank(index)}
              className={`inline-flex min-h-11 min-w-40 items-center justify-center rounded-xl border border-dashed px-4 py-2 text-sm font-semibold transition ${
                assignedKeys[index]
                  ? 'border-cyan-300 bg-cyan-400/10 text-cyan-100'
                  : 'border-slate-600 bg-slate-900/70 text-slate-400 hover:border-slate-400'
              }`}
            >
              {assignedKeys[index]
                ? optionsByKey.get(assignedKeys[index] ?? '')?.label ?? assignedKeys[index]
                : 'Drop option here'}
            </button>
          ) : null}
        </span>
      ))}
    </p>
  );
};

const SlideIntro = ({ slide }: { slide: IntroSlide }): JSX.Element => (
  <div className={`${baseSlidePanelClass} p-10 text-center sm:p-14`}>
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-400">{slide.week}</p>
    <h2 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">{slide.question}</h2>
    <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-400">{slide.body}</p>
  </div>
);

const SlideConcept = ({ slide }: { slide: ConceptSlide }): JSX.Element => (
  <div className={`${baseSlidePanelClass} overflow-hidden`}>
    <div className="border-b border-slate-700 bg-slate-800/60 px-6 py-3 text-sm font-bold tracking-wide text-teal-400">
      {slide.title}
    </div>
    <div
      className="slide-body space-y-3 px-6 py-5 text-[0.95rem] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: slide.body }}
    />
  </div>
);

const SlideBullets = ({ slide }: { slide: BulletsSlide }): JSX.Element => (
  <div className={`${baseSlidePanelClass} overflow-hidden`}>
    <div className="border-b border-slate-700 bg-slate-800/60 px-6 py-3 text-sm font-bold tracking-wide text-violet-400">
      {slide.title}
    </div>
    <ul className="space-y-3 px-6 py-5">
      {slide.items.map((item, index) => (
        <li key={index} className="flex gap-3 text-[0.95rem] leading-relaxed">
          <span className="mt-0.5 shrink-0 text-teal-400">&bull;</span>
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  </div>
);

const SlideQuote = ({ slide }: { slide: QuoteSlide }): JSX.Element => (
  <div className={`${baseSlidePanelClass} border-l-4 border-l-teal-500 px-7 py-8`}>
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-400">{slide.label}</p>
    <blockquote className="mt-4 text-lg italic leading-relaxed text-slate-200">{slide.text}</blockquote>
    <p className="mt-4 text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: slide.source }} />
  </div>
);

const SlideTerm = ({ slide }: { slide: TermSlide }): JSX.Element => (
  <div className={`${baseSlidePanelClass} px-7 py-8`}>
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{slide.label}</p>
    <p className="mt-3 inline-block rounded-lg border border-teal-800 bg-teal-900/20 px-5 py-2 text-xl font-bold text-teal-300">
      {slide.term}
    </p>
    <div
      className="slide-body mt-4 text-[0.95rem] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: slide.def }}
    />
  </div>
);

const SlideCheck = ({ slide }: { slide: CheckSlide }): JSX.Element => {
  const [revealed, setRevealed] = useState(false);
  const [selectedBinaryChoice, setSelectedBinaryChoice] = useState<'True' | 'False' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const presentation = getCheckSlidePresentation(slide.q);
  const partLabels = presentation.mode === 'multi_part' ? extractPartLabels(slide.q) : [];
  const choiceOptions = extractChoiceOptions(slide.q);
  const fillBlankData = extractFillBlankData(slide.q, slide.a);
  const [assignedBlankKeys, setAssignedBlankKeys] = useState<Array<string | null>>(
    fillBlankData ? Array.from({ length: fillBlankData.blankCount }, () => null) : [],
  );
  const [fillBlankChecked, setFillBlankChecked] = useState<boolean | null>(null);
  const optionsByKey = new Map(choiceOptions.map((option) => [option.key, option]));

  useEffect(() => {
    setRevealed(false);
    setSelectedBinaryChoice(null);
    setSelectedOption(null);
    setFillBlankChecked(null);
    setAssignedBlankKeys(fillBlankData ? Array.from({ length: fillBlankData.blankCount }, () => null) : []);
  }, [slide.q, slide.a, fillBlankData?.blankCount]);

  const handleDropOption = (blankIndex: number, optionKey: string): void => {
    setAssignedBlankKeys((current) => {
      const next = current.map((value, index) =>
        value === optionKey && index !== blankIndex ? null : value,
      );
      next[blankIndex] = optionKey;
      return next;
    });
  };

  const handleClearBlank = (blankIndex: number): void => {
    setAssignedBlankKeys((current) => current.map((value, index) => (index === blankIndex ? null : value)));
  };

  const handleConfirmFillBlank = (): void => {
    if (!fillBlankData) {
      return;
    }

    const isCorrect = fillBlankData.correctKeys.every((key, index) => assignedBlankKeys[index] === key);
    setFillBlankChecked(isCorrect);
    setRevealed(true);
  };

  const availableChoiceOptions =
    fillBlankData && fillBlankData.options.length > 0
      ? fillBlankData.options.filter((option) => !assignedBlankKeys.includes(option.key))
      : choiceOptions;

  return (
    <div className={`${baseSlidePanelClass} px-7 py-8`}>
      <div className="max-w-3xl space-y-3">
        <p className={`text-xs font-bold uppercase tracking-[0.14em] ${presentation.accentClass}`}>
          {presentation.eyebrow}
        </p>
        <h3 className="text-2xl font-semibold text-slate-100">{presentation.title}</h3>
        <p className="text-sm leading-relaxed text-slate-400">{presentation.description}</p>
      </div>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/40 p-5">
        <p className="text-base leading-relaxed text-slate-100">{slide.q}</p>

        {presentation.mode === 'binary' ? (
          <div className="mt-5 flex gap-3">
            {(['True', 'False'] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => setSelectedBinaryChoice(choice)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  selectedBinaryChoice === choice
                    ? 'border-slate-200 bg-slate-100 text-slate-950'
                    : presentation.buttonClass
                }`}
              >
                {choice}
              </button>
            ))}
          </div>
        ) : null}

        {fillBlankData && fillBlankData.options.length > 0 ? (
          <div className="mt-5 space-y-4">
            {renderFillBlankPrompt(
              fillBlankData.prompt,
              assignedBlankKeys,
              optionsByKey,
              handleDropOption,
              handleClearBlank,
            )}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-300">Option cards</p>
              <div className="flex flex-wrap gap-3">
                {availableChoiceOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', option.key);
                      event.dataTransfer.effectAllowed = 'move';
                    }}
                    onClick={() => {
                      const firstEmptyIndex = assignedBlankKeys.findIndex((value) => value === null);
                      if (firstEmptyIndex >= 0) {
                        handleDropOption(firstEmptyIndex, option.key);
                      }
                    }}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${presentation.buttonClass}`}
                  >
                    <span className="mr-2 opacity-70">{option.key}.</span>
                    {option.label}
                  </button>
                ))}
                {availableChoiceOptions.length === 0 ? (
                  <p className="text-sm text-slate-500">All options placed. Click a blank to clear it if needed.</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmFillBlank}
                disabled={assignedBlankKeys.some((value) => value === null)}
                className="rounded-lg border border-cyan-500/60 bg-cyan-500/10 px-5 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm answer
              </button>
              <button
                type="button"
                onClick={() => {
                  setAssignedBlankKeys(Array.from({ length: fillBlankData.blankCount }, () => null));
                  setFillBlankChecked(null);
                  setRevealed(false);
                }}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
              >
                Reset blanks
              </button>
            </div>
            {fillBlankChecked !== null ? (
              <p className={`text-sm font-medium ${fillBlankChecked ? 'text-emerald-300' : 'text-rose-300'}`}>
                {fillBlankChecked ? 'Correct. Review why below.' : 'Not quite. Review the explanation below.'}
              </p>
            ) : null}
          </div>
        ) : null}

        {choiceOptions.length > 0 && !fillBlankData ? (
          <div className="mt-5 space-y-3">
            <p className="text-sm font-medium text-slate-300">
              {presentation.mode === 'multi_part' ? 'Step through each part' : 'Choose an option'}
            </p>
            <div className="flex flex-wrap gap-3">
              {choiceOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setSelectedOption(option.key)}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                    selectedOption === option.key
                      ? 'border-slate-200 bg-slate-100 text-slate-950'
                      : presentation.buttonClass
                  }`}
                >
                  <span className="mr-2 opacity-70">{option.key}.</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {presentation.mode === 'fill_blank' && !fillBlankData && choiceOptions.length === 0 ? (
          <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
            Fill in the missing term mentally first, then reveal the explanation to check the exact wording.
          </div>
        ) : null}

        {presentation.mode === 'multi_part' ? (
          <div className="mt-5 space-y-3">
            {partLabels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {partLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold text-fuchsia-200"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : null}
            {choiceOptions.length === 0 ? (
              <p className="text-sm leading-relaxed text-slate-400">
                Work through each part mentally, then reveal the explanation to compare your structure.
              </p>
            ) : null}
          </div>
        ) : null}

        {(presentation.mode === 'case' || presentation.mode === 'reflection') && choiceOptions.length === 0 ? (
          <div className="mt-5 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
            Pause and make your call first. Then reveal the explanation and compare it with your reasoning.
          </div>
        ) : null}

        {!fillBlankData ? (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setRevealed((current) => !current)}
              className={`rounded-lg border bg-transparent px-5 py-2 text-sm font-semibold ${presentation.buttonClass}`}
            >
              {revealed ? 'Hide explanation' : 'Reveal explanation'}
            </button>
          </div>
        ) : null}

        {revealed ? (
          <div
            className="mt-4 rounded-r-lg border-l-[3px] border-violet-600 bg-violet-900/10 px-4 py-3 text-[0.95rem] leading-relaxed text-slate-200"
            dangerouslySetInnerHTML={{ __html: slide.a }}
          />
        ) : null}
      </div>
    </div>
  );
};

const SlideSummary = ({ slide }: { slide: SummarySlide }): JSX.Element => (
  <div className="min-h-full rounded-2xl border border-emerald-700 bg-slate-900/60 px-7 py-8">
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-400">Summary</p>
    <h3 className="mt-3 text-lg font-semibold">{slide.title}</h3>
    <ul className="mt-4 space-y-2">
      {slide.points.map((point, index) => (
        <li key={index} className="flex gap-2 text-sm leading-relaxed">
          <span className="mt-0.5 shrink-0 font-bold text-emerald-400">&#10003;</span>
          <span>{point}</span>
        </li>
      ))}
    </ul>
    <p className="mt-6 border-t border-slate-700 pt-5 text-sm text-slate-400">{slide.cta}</p>
  </div>
);

const RenderSlide = ({ slide }: { slide: LessonSlide }): JSX.Element => {
  switch (slide.type) {
    case 'intro':
      return <SlideIntro slide={slide} />;
    case 'concept':
      return <SlideConcept slide={slide} />;
    case 'bullets':
      return <SlideBullets slide={slide} />;
    case 'quote':
      return <SlideQuote slide={slide} />;
    case 'term':
      return <SlideTerm slide={slide} />;
    case 'check':
      return <SlideCheck slide={slide} />;
    case 'summary':
      return <SlideSummary slide={slide} />;
  }
};

const LessonViewer = (): JSX.Element => {
  const navigate = useNavigate();
  const { lessonIdx } = useParams<{ lessonIdx: string }>();
  const [searchParams] = useSearchParams();
  const idx = Number(lessonIdx ?? '0');
  const lesson = SECURITY_PLUS_LESSONS[idx];

  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);
  const slideViewportRef = useRef<HTMLDivElement | null>(null);

  const total = lesson?.slides.length ?? 0;
  const requestedSlideParam = Number(searchParams.get('slide') ?? '1') - 1;
  const hasRequestedSlide = searchParams.has('slide');
  const requestedSlideIndex = clampSlideIndex(requestedSlideParam, total);
  const isLast = current === total - 1;
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;

  const goNext = useCallback(() => {
    if (!lesson) {
      return;
    }
    if (current >= total - 1) {
      markLessonDone(lesson.id);
      setFinished(true);
      return;
    }
    setCurrent((value) => value + 1);
  }, [current, lesson, total]);

  const goPrev = useCallback(() => {
    setCurrent((value) => Math.max(0, value - 1));
  }, []);

  useEffect(() => {
    if (finished) {
      return;
    }
    const handler = (event: KeyboardEvent): void => {
      const active = document.activeElement as HTMLElement | null;
      if (active && ['INPUT', 'SELECT', 'TEXTAREA'].includes(active.tagName)) {
        return;
      }
      if (event.key === 'ArrowLeft') {
        goPrev();
      }
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [finished, goNext, goPrev]);

  useEffect(() => {
    slideViewportRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [current, lesson?.id]);

  useEffect(() => {
    setCurrent(hasRequestedSlide ? requestedSlideIndex : 0);
    setFinished(false);
  }, [hasRequestedSlide, lesson?.id, requestedSlideIndex]);

  if (!lesson) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
        <button
          type="button"
          onClick={() => navigate('/lessons')}
          className="rounded-md border border-slate-700 bg-transparent px-4 py-2 text-sm hover:bg-slate-800"
        >
          &larr; Back to Lessons
        </button>
      </section>
    );
  }

  if (finished) {
    const hasNext = idx < SECURITY_PLUS_LESSONS.length - 1;
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-10 text-center">
          <p className="text-4xl">Target complete</p>
          <h2 className="mt-4 text-2xl font-bold text-teal-300">{lesson.title} Complete</h2>
          <p className="mt-2 text-slate-400">
            You finished all {total} slides for {lesson.subtitle}.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/lessons')}
              className="rounded-md bg-primary px-5 py-2 font-semibold text-white hover:bg-teal-600"
            >
              &larr; Back to Lessons
            </button>
            {hasNext ? (
              <button
                type="button"
                onClick={() => {
                  setFinished(false);
                  setCurrent(0);
                  navigate(`/lessons/${idx + 1}`);
                }}
                className="rounded-md border border-slate-700 bg-transparent px-5 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                Start {SECURITY_PLUS_LESSONS[idx + 1]?.title} &rarr;
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  const slide = lesson.slides[current];

  return (
    <section className="mx-auto grid h-full w-full max-w-5xl min-h-0 grid-rows-[auto_auto_minmax(0,7fr)_minmax(5.5rem,1fr)] gap-5 overflow-hidden">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/lessons')}
          className="rounded-md border border-slate-700 bg-transparent px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-teal-300"
        >
          &larr; Lessons
        </button>
        <div>
          <p className="text-sm font-semibold">
            {lesson.title} - {lesson.subtitle}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>
            Slide {current + 1} of {total}
          </span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div
        ref={slideViewportRef}
        data-testid="lesson-slide-viewport"
        className="min-h-0 overflow-y-auto px-2"
      >
        <div className="mx-auto min-h-full w-full" key={`${lesson.id}-${current}`}>
          {slide ? <RenderSlide slide={slide} /> : null}
        </div>
      </div>

      <div
        data-testid="lesson-nav"
        className="flex min-h-0 items-end border-t border-slate-800 bg-slate-950/90 pt-4 backdrop-blur"
      >
        <div className="w-full space-y-3">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={current === 0}
              className="rounded-md border border-slate-700 bg-transparent px-6 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              &larr; Prev
            </button>
            <span className="min-w-[60px] text-center text-xs text-slate-500">
              {current + 1} / {total}
            </span>
            <button
              type="button"
              onClick={goNext}
              className={`rounded-md px-6 py-2 text-sm font-semibold ${
                isLast
                  ? 'bg-violet-600 text-white hover:bg-violet-500'
                  : 'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800'
              }`}
            >
              {isLast ? 'Finish' : 'Next ->'}
            </button>
          </div>
          <p className="text-center text-xs text-slate-600">
            <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[0.65rem]">
              &larr;
            </kbd>{' '}
            prev{' '}
            <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[0.65rem]">
              &rarr;
            </kbd>{' '}
            /{' '}
            <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[0.65rem]">
              Space
            </kbd>{' '}
            next
          </p>
        </div>
      </div>
    </section>
  );
};

export default LessonViewer;
