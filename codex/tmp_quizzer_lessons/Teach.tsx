import { useDeferredValue, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SECURITY_PLUS_LESSONS, getDoneLessons, searchLessons } from '../data/securityPlusLessons';

const getSlideTypeLabel = (slideType: string): string => {
  switch (slideType) {
    case 'intro':
      return 'Intro';
    case 'concept':
      return 'Concept';
    case 'bullets':
      return 'Bullets';
    case 'quote':
      return 'Callout';
    case 'term':
      return 'Key Term';
    case 'check':
      return 'Check';
    case 'summary':
      return 'Summary';
    default:
      return 'Slide';
  }
};

const Teach = (): JSX.Element => {
  const navigate = useNavigate();
  const [done, setDone] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const trimmedQuery = deferredQuery.trim();
  const searchResults = trimmedQuery ? searchLessons(trimmedQuery) : [];

  useEffect(() => {
    setDone(getDoneLessons());
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Security+ Guided Lessons</h1>
        <p className="text-slate-300">
          CompTIA Security+ | {SECURITY_PLUS_LESSONS.length} structured lessons
        </p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-400">Lesson Search</p>
            <h2 className="text-xl font-semibold text-slate-100">Search slide content</h2>
          </div>
          <div className="flex w-full max-w-xl gap-3">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try: zero trust, certificate pinning, ALE..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {trimmedQuery ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-400">Matches</p>
            <p className="text-sm text-slate-400">
              {searchResults.length} matching {searchResults.length === 1 ? 'slide' : 'slides'} for "{trimmedQuery}"
            </p>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {searchResults.map((result) => (
                <button
                  key={`${result.lessonId}-${result.slideIndex}-${result.slideLabel}`}
                  type="button"
                  onClick={() => navigate(`/lessons/${result.lessonIndex}?slide=${result.slideIndex + 1}`)}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-teal-400 hover:bg-slate-800/70"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <span className="rounded-full border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-teal-300">
                      {result.lessonTitle}
                    </span>
                    <span>Slide {result.slideIndex + 1}</span>
                    <span>{getSlideTypeLabel(result.slideType)}</span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold leading-snug text-slate-100 group-hover:text-teal-200">
                    {result.slideLabel}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500">{result.lessonSubtitle}</p>
                  <p className="mt-4 text-sm leading-relaxed text-slate-300">{result.snippet}</p>
                  <p className="mt-5 text-sm font-semibold text-teal-300">Open this slide -&gt;</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-8 text-center">
              <p className="text-lg font-semibold text-slate-200">No matching slides found</p>
              <p className="mt-2 text-sm text-slate-400">
                Try a broader keyword or a different phrase from the lesson content.
              </p>
            </div>
          )}
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY_PLUS_LESSONS.map((lesson, index) => {
            const isDone = done.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => navigate(`/lessons/${index}`)}
                className={`relative rounded-xl border bg-slate-900/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-teal-400 hover:bg-slate-800/60 ${
                  isDone ? 'border-emerald-700' : 'border-slate-700'
                }`}
              >
                <span className="absolute right-4 top-4 text-sm font-bold tracking-[0.18em] text-slate-500">
                  {lesson.icon}
                </span>
                <p className="text-xs font-bold uppercase tracking-widest text-teal-400">{lesson.title}</p>
                <h3 className="mt-1 text-sm font-semibold leading-snug">{lesson.subtitle}</h3>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                    {lesson.slides.length} slides
                  </span>
                  {isDone ? (
                    <span className="rounded-full border border-emerald-700 bg-emerald-900/30 px-2.5 py-0.5 text-xs text-emerald-400">
                      Complete
                    </span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default Teach;
