import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { GEX1015_LESSONS, getDoneLessons } from '../data/gex1015Lessons';

const Teach = (): JSX.Element => {
  const navigate = useNavigate();
  const [done, setDone] = useState<string[]>([]);

  useEffect(() => {
    setDone(getDoneLessons());
  }, []);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">GEX1015 &mdash; Guided Lessons</h1>
        <p className="text-slate-300">
          Life, the Universe, and Everything &nbsp;|&nbsp; 5 weeks of structured lessons
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GEX1015_LESSONS.map((lesson, i) => {
          const isDone = done.includes(lesson.id);
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => navigate(`/lessons/${i}`)}
              className={`relative rounded-xl border bg-slate-900/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-teal-400 hover:bg-slate-800/60 ${
                isDone ? 'border-emerald-700' : 'border-slate-700'
              }`}
            >
              <span className="absolute right-4 top-4 text-2xl opacity-50">{lesson.icon}</span>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-400">
                {lesson.title}
              </p>
              <h3 className="mt-1 text-sm font-semibold leading-snug">{lesson.subtitle}</h3>
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                  {lesson.slides.length} slides
                </span>
                {isDone ? (
                  <span className="rounded-full border border-emerald-700 bg-emerald-900/30 px-2.5 py-0.5 text-xs text-emerald-400">
                    &#10003; Complete
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="rounded-md border border-slate-700 bg-transparent px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
      >
        &larr; Back to Home
      </button>
    </section>
  );
};

export default Teach;
