import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { DevMenu } from './components';
import {
  Acronyms,
  Analytics,
  CreateTest,
  Hangman,
  Home,
  LessonViewer,
  QuestionBank,
  QuestionEditor,
  Results,
  Settings,
  Teach,
  TestRunner,
} from './pages';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/lessons', label: 'Lessons' },
  { to: '/acronyms', label: 'Acronyms' },
  { to: '/create-test', label: 'Create Test' },
  { to: '/results', label: 'Results' },
  { to: '/question-bank', label: 'Question Bank' },
  { to: '/question-editor', label: 'Question Editor' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/settings', label: 'Settings' },
];

const App = (): JSX.Element => {
  const location = useLocation();
  const isLessonViewerRoute = /^\/lessons\/[^/]+$/.test(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="shrink-0 border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4">
          <span className="text-xl font-bold text-teal-300">Cybersec Quiz</span>
          <ul className="flex flex-wrap items-center gap-3 text-sm">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-1 transition ${
                      isActive ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main
        className={`mx-auto flex w-full min-h-0 flex-1 flex-col px-4 ${
          isLessonViewerRoute ? 'max-w-6xl overflow-hidden py-6' : 'max-w-6xl overflow-y-auto py-8'
        }`}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lessons" element={<Teach />} />
          <Route path="/lessons/:lessonIdx" element={<LessonViewer />} />
          <Route path="/hangman" element={<Hangman />} />
          <Route path="/acronyms" element={<Acronyms />} />
          <Route path="/create-test" element={<CreateTest />} />
          <Route path="/test/:testId" element={<TestRunner />} />
          <Route path="/results" element={<Results />} />
          <Route path="/question-bank" element={<QuestionBank />} />
          <Route path="/question-editor" element={<QuestionEditor />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      {import.meta.env.DEV ? <DevMenu /> : null}
    </div>
  );
};

export default App;
