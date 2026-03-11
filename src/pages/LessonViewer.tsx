import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  GEX1015_LESSONS,
  markLessonDone,
  type LessonSlide,
  type IntroSlide,
  type ConceptSlide,
  type BulletsSlide,
  type QuoteSlide,
  type TermSlide,
  type CheckSlide,
  type SummarySlide,
} from '../data/gex1015Lessons';

// ── Slide renderers ──────────────────────────

const SlideIntro = ({ slide }: { slide: IntroSlide }): JSX.Element => (
  <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-10 text-center sm:p-14">
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-400">{slide.week}</p>
    <h2 className="mt-3 text-2xl font-bold leading-snug sm:text-3xl">{slide.question}</h2>
    <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-400">{slide.body}</p>
  </div>
);

const SlideConcept = ({ slide }: { slide: ConceptSlide }): JSX.Element => (
  <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/60">
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
  <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/60">
    <div className="border-b border-slate-700 bg-slate-800/60 px-6 py-3 text-sm font-bold tracking-wide text-violet-400">
      {slide.title}
    </div>
    <ul className="space-y-3 px-6 py-5">
      {slide.items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[0.95rem] leading-relaxed">
          <span className="mt-0.5 shrink-0 text-teal-400">&bull;</span>
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  </div>
);

const SlideQuote = ({ slide }: { slide: QuoteSlide }): JSX.Element => (
  <div className="rounded-2xl border border-slate-700 border-l-4 border-l-teal-500 bg-slate-900/60 px-7 py-8">
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-400">{slide.label}</p>
    <blockquote className="mt-4 text-lg italic leading-relaxed text-slate-200">
      {slide.text}
    </blockquote>
    <p
      className="mt-4 text-sm text-slate-400"
      dangerouslySetInnerHTML={{ __html: slide.source }}
    />
  </div>
);

const SlideTerm = ({ slide }: { slide: TermSlide }): JSX.Element => (
  <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-7 py-8">
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

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 px-7 py-8">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-400">
        Knowledge Check
      </p>
      <p className="mt-4 text-lg leading-relaxed">{slide.q}</p>
      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-5 rounded-lg border border-violet-600 bg-transparent px-5 py-2 text-sm font-semibold text-violet-400 hover:bg-violet-900/30"
        >
          Reveal Answer
        </button>
      ) : null}
      <div
        className={`mt-4 rounded-r-lg border-l-[3px] border-violet-600 bg-violet-900/10 px-4 py-3 text-[0.95rem] leading-relaxed transition-opacity duration-300 ${
          revealed ? 'opacity-100' : 'pointer-events-none h-0 overflow-hidden opacity-0'
        }`}
        dangerouslySetInnerHTML={{ __html: slide.a }}
      />
    </div>
  );
};

const SlideSummary = ({ slide }: { slide: SummarySlide }): JSX.Element => (
  <div className="rounded-2xl border border-emerald-700 bg-slate-900/60 px-7 py-8">
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-400">Summary</p>
    <h3 className="mt-3 text-lg font-semibold">{slide.title}</h3>
    <ul className="mt-4 space-y-2">
      {slide.points.map((pt, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed">
          <span className="mt-0.5 shrink-0 font-bold text-emerald-400">&#10003;</span>
          <span>{pt}</span>
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

// ── Main component ───────────────────────────

const LessonViewer = (): JSX.Element => {
  const navigate = useNavigate();
  const { lessonIdx } = useParams<{ lessonIdx: string }>();
  const idx = Number(lessonIdx ?? '0');
  const lesson = GEX1015_LESSONS[idx];

  const [current, setCurrent] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = lesson?.slides.length ?? 0;
  const isLast = current === total - 1;
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;

  const goNext = useCallback(() => {
    if (!lesson) return;
    if (current >= total - 1) {
      markLessonDone(lesson.id);
      setFinished(true);
      return;
    }
    setCurrent((c) => c + 1);
  }, [current, lesson, total]);

  const goPrev = useCallback(() => {
    setCurrent((c) => Math.max(0, c - 1));
  }, []);

  // keyboard nav
  useEffect(() => {
    if (finished) return;
    const handler = (e: KeyboardEvent): void => {
      const active = document.activeElement as HTMLElement | null;
      if (active && ['INPUT', 'SELECT', 'TEXTAREA'].includes(active.tagName)) return;
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [finished, goNext, goPrev]);

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

  // ── Completion screen ──
  if (finished) {
    const hasNext = idx < GEX1015_LESSONS.length - 1;
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-10 text-center">
          <p className="text-4xl">&#x1F3AF;</p>
          <h2 className="mt-4 text-2xl font-bold text-teal-300">{lesson.title} Complete!</h2>
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
                Start {GEX1015_LESSONS[idx + 1]?.title} &rarr;
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  // ── Active lesson ──
  const slide = lesson.slides[current];

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/lessons')}
          className="rounded-md border border-slate-700 bg-transparent px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-teal-300"
        >
          &larr; Home
        </button>
        <div>
          <p className="text-sm font-semibold">
            {lesson.title} &mdash; {lesson.subtitle.split(':')[0]}
          </p>
          {lesson.subtitle.includes(':') ? (
            <p className="text-xs text-slate-500">
              {lesson.subtitle.split(':').slice(1).join(':').trim()}
            </p>
          ) : null}
        </div>
      </div>

      {/* Progress */}
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

      {/* Slide */}
      <div className="min-h-[320px]" key={current}>
        {slide ? <RenderSlide slide={slide} /> : null}
      </div>

      {/* Navigation */}
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
          {isLast ? 'Finish \u2713' : 'Next \u2192'}
        </button>
      </div>
      <p className="text-center text-xs text-slate-600">
        <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[0.65rem]">
          &larr;
        </kbd>{' '}
        prev &nbsp;{' '}
        <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[0.65rem]">
          &rarr;
        </kbd>{' '}
        /{' '}
        <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[0.65rem]">
          Space
        </kbd>{' '}
        next
      </p>
    </section>
  );
};

export default LessonViewer;
