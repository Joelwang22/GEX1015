// ─────────────────────────────────────────────
// GEX1015 Guided Lesson Data
// ─────────────────────────────────────────────

export interface Slide {
  type: 'intro' | 'concept' | 'bullets' | 'quote' | 'term' | 'check' | 'summary';
}

export interface IntroSlide extends Slide {
  type: 'intro';
  week: string;
  question: string;
  body: string;
}

export interface ConceptSlide extends Slide {
  type: 'concept';
  title: string;
  body: string;
}

export interface BulletsSlide extends Slide {
  type: 'bullets';
  title: string;
  items: string[];
}

export interface QuoteSlide extends Slide {
  type: 'quote';
  label: string;
  text: string;
  source: string;
}

export interface TermSlide extends Slide {
  type: 'term';
  label: string;
  term: string;
  def: string;
}

export interface CheckSlide extends Slide {
  type: 'check';
  q: string;
  a: string;
}

export interface SummarySlide extends Slide {
  type: 'summary';
  title: string;
  points: string[];
  cta: string;
}

export type LessonSlide =
  | IntroSlide
  | ConceptSlide
  | BulletsSlide
  | QuoteSlide
  | TermSlide
  | CheckSlide
  | SummarySlide;

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  slides: LessonSlide[];
}

const STORAGE_KEY = 'gex1015_teach_done';

export function getDoneLessons(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function markLessonDone(id: string): void {
  const done = getDoneLessons();
  if (!done.includes(id)) {
    done.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(done));
  }
}

interface LessonInterleaveRule {
  after: string;
  questionIncludes: string;
}

const LESSON_INTERLEAVE_RULES: Partial<Record<Lesson['id'], LessonInterleaveRule[]>> = {
  week1: [
    { after: 'Philosophy vs. Science', questionIncludes: 'A scientist discovers that a fetus develops neural activity' },
    { after: 'Questions This Course Explores', questionIncludes: 'What is the difference between a scientific question' },
  ],
  week2: [
    { after: 'Objections to Hedonism', questionIncludes: 'Which of Nozick’s conclusions is most accurate?' },
    { after: 'Robert Nozick — Anarchy, State, and Utopia (1974)', questionIncludes: 'What is the BEST valid logical form for Nozick' },
    { after: 'Theory 2: The Desire Theory', questionIncludes: 'On the Desire Theory, is it possible that a person doesn’t know how valuable their life is?' },
    { after: 'Objections to the Desire Theory', questionIncludes: 'oppressed slave' },
    { after: 'Theory 3: Objective List Theories', questionIncludes: 'Darren\'s mother\'s only desire is to see Darren married before she dies.' },
    { after: 'How Exam Cases Distinguish the Three Theories', questionIncludes: 'Anna wants only pleasure and decides to spend her entire life in the experience machine.' },
  ],
  week3: [
    { after: 'Moral Terminology', questionIncludes: 'If an action is supererogatory' },
    { after: 'Classic Utilitarianism', questionIncludes: 'You have two actions. Action A: 2 units of pleasure' },
    { after: 'Moral Status on Classic Utilitarianism', questionIncludes: 'An action generates 10 units of pleasure and 10 units of pain.' },
    { after: 'Singer’s Argument', questionIncludes: 'A philosopher responds to Singer' },
    { after: 'Singer’s Two Versions', questionIncludes: 'Moonyoung already owns enough shoes.' },
    { after: 'Strong vs. Moderate: What Actually Changes?', questionIncludes: 'Singer\'s strong version of his principle requires us to maximise total net happiness.' },
  ],
  week4: [
    { after: 'Kant: Treating Persons Merely as a Means', questionIncludes: 'According to Kant (as interpreted in class)' },
    { after: 'Kant: Treating Persons Merely as a Means', questionIncludes: 'In the Loop case:' },
    { after: 'Thomson: “Turning the Trolley” (2008)', questionIncludes: 'If you don’t need another person to achieve your aim' },
    { after: 'Summary: Who Says What?', questionIncludes: 'Both classic utilitarians and Thomson think the common intuition about the Bystander case is wrong.' },
    { after: 'Summary: Who Says What?', questionIncludes: 'In the Transplant case, a surgeon can save 5 patients only by cutting up one healthy bystander.' },
    { after: 'Exam Move: Same Structure, Same Verdict', questionIncludes: 'Suppose the only way to save five is to push a heavy boulder onto the track' },
    { after: 'Exam Move: Same Structure, Same Verdict', questionIncludes: 'Both Thomson and classic utilitarianism treat the moral difference between Bridge and Bystander as irrelevant.' },
    { after: 'Exam Move: Same Structure, Same Verdict', questionIncludes: 'Give an example for each of the four combinations:' },
  ],
  week5: [
    { after: 'Validity', questionIncludes: 'An argument with all false premises and a false conclusion can still be valid.' },
    { after: 'Soundness', questionIncludes: 'If an argument’s premises and conclusion are all true, the argument is sound.' },
    { after: 'The Four Common Argument Forms', questionIncludes: 'Fill in the blank so the argument becomes VALID:' },
    { after: 'Practice: Identifying Argument Forms', questionIncludes: 'How do you PROVE that an argument is invalid?' },
    { after: 'Cultural Relativism', questionIncludes: 'According to cultural relativism, which is true?' },
    { after: 'Rachels: Three Consequences That Make Cultural Relativism Implausible', questionIncludes: 'A cultural relativist (Samantha) responds to Rachels' },
  ],
  week6: [
    { after: 'The Problem of Evil — Revised Version', questionIncludes: 'What valid argument form does the Problem of Evil use?' },
    { after: 'The Problem of Evil — Revised Version', questionIncludes: 'Why is the first version of the Problem of Evil' },
    { after: 'The Problem of Evil — Revised Version', questionIncludes: 'Why does the debate over the revised Problem of Evil usually focus on Premise 2' },
    { after: 'Six Theodicies (Responses to the Problem of Evil)', questionIncludes: 'If a theist accepts Theodicy 6' },
    { after: 'Perry — Dialogue on Good, Evil, and the Existence of God', questionIncludes: 'In Perry\'s Dialogue, Miller defends the "laws of nature" theodicy' },
  ],
  week9: [
    { after: 'The Chinese Room and Its Limit', questionIncludes: 'What does the Chinese Room thought experiment show' },
    { after: 'Functional Organization and Isomorphs', questionIncludes: 'What is an isomorph in the Week 9 discussion?' },
    { after: 'Why Techno-Optimism Is Still Premature', questionIncludes: 'Why does Schneider think techno-optimists move too quickly' },
  ],
  week12: [
    { after: 'Necessary and Sufficient Conditions for Art', questionIncludes: 'If X is a necessary and sufficient condition for art' },
    { after: 'Beauty Is Not the Definition of Art', questionIncludes: 'Why is beauty not a successful definition of art' },
    { after: 'Levinson: A Historical Definition of Art', questionIncludes: 'According to Levinson' },
    { after: 'The Three Kinds of Art-Making Intention', questionIncludes: 'Why does Levinson include art-unconscious intention' },
    { after: 'Revolutionary Art', questionIncludes: 'How does Levinson respond to the objection about revolutionary art' },
  ],
  week13: [
    { after: 'Nagel: The Deprivation Account', questionIncludes: 'On Nagel' },
    { after: 'First Challenge: Can Deprivation Be Bad If You Do Not Mind It?', questionIncludes: 'What is the point of Nagel' },
    { after: 'Second Challenge: When Is Death Bad for You?', questionIncludes: 'Which premise should Nagel reject' },
    { after: 'Third Challenge: Prenatal and Posthumous Nonexistence', questionIncludes: 'Why does Nagel reject Lucretius' },
    { after: 'Death at an Old Age', questionIncludes: 'Why might Nagel still think death is bad' },
  ],
};

const getSlideAnchor = (slide: LessonSlide): string | null => {
  switch (slide.type) {
    case 'intro':
      return slide.week;
    case 'concept':
    case 'bullets':
    case 'summary':
      return slide.title;
    case 'quote':
      return slide.label;
    case 'term':
      return slide.term;
    default:
      return null;
  }
};

const interleaveLessonChecks = (lesson: Lesson): Lesson => {
  const rules = LESSON_INTERLEAVE_RULES[lesson.id];
  if (!rules || rules.length === 0) {
    return lesson;
  }

  const checks = lesson.slides.filter((slide): slide is CheckSlide => slide.type === 'check');
  const contentSlides = lesson.slides.filter((slide) => slide.type !== 'check');
  const usedQuestions = new Set<string>();
  const interleavedSlides: LessonSlide[] = [];

  for (const slide of contentSlides) {
    interleavedSlides.push(slide);

    const anchor = getSlideAnchor(slide);
    if (!anchor) {
      continue;
    }

    for (const rule of rules) {
      if (rule.after !== anchor) {
        continue;
      }

      const matchingCheck = checks.find((check) => !usedQuestions.has(check.q) && check.q.includes(rule.questionIncludes));
      if (!matchingCheck) {
        continue;
      }

      usedQuestions.add(matchingCheck.q);
      interleavedSlides.push(matchingCheck);
    }
  }

  const remainingChecks = checks.filter((check) => !usedQuestions.has(check.q));
  if (remainingChecks.length === 0) {
    return { ...lesson, slides: interleavedSlides };
  }

  const summaryIndex = interleavedSlides.findIndex((slide) => slide.type === 'summary');
  if (summaryIndex === -1) {
    return { ...lesson, slides: [...interleavedSlides, ...remainingChecks] };
  }

  return {
    ...lesson,
    slides: [
      ...interleavedSlides.slice(0, summaryIndex),
      ...remainingChecks,
      ...interleavedSlides.slice(summaryIndex),
    ],
  };
};

const RAW_GEX1015_LESSONS: Lesson[] = [
  // ══════════════════════════════════════════════
  // WEEK 1 — Introduction to Philosophy
  // ══════════════════════════════════════════════
  {
    id: 'week1',
    title: 'Week 1',
    subtitle: 'Introduction to Philosophy',
    icon: '\uD83E\uDDE0',
    slides: [
      {
        type: 'intro',
        week: 'Week 1 — Introduction',
        question: 'What is philosophy, and what kinds of questions does it try to answer?',
        body: 'This lesson introduces what philosophy is, how it differs from science and other disciplines, and previews the major questions this course explores.',
      },
      {
        type: 'term',
        label: 'Core Definition',
        term: 'Philosophy',
        def: 'Philosophy explores, using <strong>reason and argument</strong>, important questions that other disciplines are <strong>unwilling or unable to answer</strong>.<br><br>Unlike science (which answers questions through observation and experiment), philosophy tackles questions where no amount of further data can settle the matter — questions about morality, existence, knowledge, and meaning.',
      },
      {
        type: 'concept',
        title: 'Philosophy vs. Science',
        body: '<p>Science can supply <strong>facts</strong>. Philosophy determines what those facts <strong>mean</strong> morally or conceptually.</p><p><strong>Example — Abortion:</strong> Science can tell us when a fetus\'s heartbeat begins. But that fact alone does not settle whether abortion is morally wrong. We would still need to know whether having a heartbeat has <em>moral significance</em> — i.e., whether it is always wrong to kill something with a heartbeat, and if not, when exactly it is wrong. <em>No further scientific research can answer this question.</em></p><p>Answering such questions is what philosophy aims to do.</p>',
      },
      {
        type: 'bullets',
        title: 'Questions This Course Explores',
        items: [
          '<strong>Ethics:</strong> Is it morally wrong not to help people dying of extreme poverty in developing countries?',
          '<strong>Ethics:</strong> Is it morally right to sacrifice one person to save five? (Trolley problems)',
          '<strong>Philosophy of religion:</strong> If there is a god, why do so many bad things happen? Does suffering disprove God\'s existence?',
          '<strong>Metaphysics:</strong> Do we really have free will? Or is it just an illusion?',
          '<strong>Philosophy of mind:</strong> Can AI be conscious? Can AI think?',
          '<strong>Metaphysics:</strong> Are we living in a computer simulation?',
          '<strong>Aesthetics:</strong> What is the definition of art?',
        ],
      },
      {
        type: 'check',
        q: 'A scientist discovers that a fetus develops neural activity at 24 weeks. Does this scientific fact, by itself, settle whether abortion is morally permissible at 25 weeks?',
        a: '<strong>No.</strong> The scientific fact tells us <em>when</em> neural activity begins, but it does not tell us whether neural activity has moral significance — e.g., whether it is wrong to end the life of something with neural activity. That is a philosophical question about the moral status of neural activity, which no experiment can answer.',
      },
      {
        type: 'check',
        q: 'What is the difference between a scientific question and a philosophical question?',
        a: 'A <strong>scientific question</strong> can (in principle) be answered through observation, experiment, and data collection (e.g., "At what temperature does water boil?"). A <strong>philosophical question</strong> cannot be settled by empirical data alone — it requires reason and argument to evaluate competing claims about morality, meaning, existence, or concepts (e.g., "Is it wrong to kill something with a heartbeat?").',
      },
      {
        type: 'summary',
        title: 'Week 1 — Key Takeaways',
        points: [
          'Philosophy explores important questions using reason and argument.',
          'It addresses questions that science and other disciplines are unable to settle with data alone.',
          'Science gives facts; philosophy evaluates the moral and conceptual significance of those facts.',
          'This course covers ethics (morality, right & wrong), philosophy of religion, and logic.',
          'Key topics: goodness, consequentialism, non-consequentialism, relativism, the Problem of Evil.',
        ],
        cta: 'Week 1 provides the foundation — move on to Week 2 to dive into the first major theory.',
      },
    ],
  },

  // ══════════════════════════════════════════════
  // WEEK 2 — Goodness
  // ══════════════════════════════════════════════
  {
    id: 'week2',
    title: 'Week 2',
    subtitle: 'Goodness: What Is a Good Life?',
    icon: '\u2728',
    slides: [
      {
        type: 'intro',
        week: 'Week 2 \u2014 Goodness',
        question: 'What is good for a person? What is a good life?',
        body: 'This lesson covers three major theories of non-instrumental goodness: Hedonism, Desire Theory, and Objective List Theories \u2014 plus Nozick\u2019s Experience Machine thought experiment.',
      },
      {
        type: 'term',
        label: 'Key Distinction',
        term: 'Instrumental vs. Non-instrumental Goodness',
        def: '<strong>Instrumentally good:</strong> good because of the good things it brings about (a means to an end). E.g., money, vaccinations.<br><br><strong>Non-instrumentally good:</strong> good for its own sake, in and of itself. E.g., pleasure. This is what theories of \u201cthe good life\u201d are really about.<br><br>Something can be <strong>both</strong> instrumentally and non-instrumentally good (e.g., pleasure from exercise).',
      },
      {
        type: 'concept',
        title: 'Theory 1: Hedonism',
        body: '<p><strong>Hedonism</strong> is the view that pleasure is the <strong>only</strong> thing that is non-instrumentally good, and pain is the only thing that is non-instrumentally bad.</p><p>Pleasure means any <strong>state of mind that feels good</strong>: pleasant bodily sensations, positive emotions (joy, pride), and \u201chigher\u201d pleasures (artistic, intellectual). Pain means any state of mind that feels bad.</p><p><strong>Attractions:</strong> It\u2019s hard to deny that pleasure is non-instrumentally good. It\u2019s hard to think of anything else that obviously is. And hedonism allows many different ways to live a good life, since sources of pleasure vary widely.</p>',
      },
      {
        type: 'bullets',
        title: 'Objections to Hedonism',
        items: [
          '<strong>Pleasure based on false beliefs:</strong> If your friends secretly hate you but act friendly, are you equally well off? Hedonism says yes (same pleasure), but most people say no.',
          '<strong>The Experience Machine (Nozick):</strong> A machine gives you any experience you want \u2014 you\u2019d think you\u2019re writing novels, making friends \u2014 but you\u2019re just floating in a tank. Most people would NOT plug in for life.',
          '<strong>Nozick\u2019s point:</strong> If hedonism were true, there\u2019d be no reason not to plug in. Our hesitation suggests something besides pleasure is non-instrumentally good.',
          '<strong>Hedonist response:</strong> Our intuitions may be distorted by status quo bias, fear of the unfamiliar, or guilt about leaving others behind.',
        ],
      },
      {
        type: 'quote',
        label: 'Robert Nozick \u2014 Anarchy, State, and Utopia (1974)',
        text: '\u201cWe learn that something matters to us in addition to experience [which includes pleasure] by imagining an experience machine and then realizing that we would not use it.\u201d',
        source: '<strong>Robert Nozick</strong> (1938\u20132002) \u2014 <em>Anarchy, State, and Utopia</em>, p. 265',
      },
      {
        type: 'concept',
        title: 'Theory 2: The Desire Theory',
        body: '<p><strong>The Desire Theory</strong> says that the fulfillment of your desires is the <strong>only</strong> thing that is non-instrumentally good for you, and the frustration of your desires is the only thing that is non-instrumentally bad.</p><p><strong>How it differs from hedonism:</strong> Some people might not desire pleasure. And you might not get pleasure from desire fulfillment if you don\u2019t know it\u2019s been fulfilled.</p><p><strong>Attractions:</strong> It explains why we shouldn\u2019t plug into the experience machine (many of our desires wouldn\u2019t <em>actually</em> be fulfilled \u2014 we\u2019d just <em>think</em> they were). It allows even more diversity in good lives than hedonism.</p>',
      },
      {
        type: 'bullets',
        title: 'Objections to the Desire Theory',
        items: [
          '<strong>Desires for the wrong things:</strong> An oppressed slave wanting only to serve their master; a promising youth with a death wish; an alcoholic who just wants to drink all day.',
          '<strong>The grass-counter:</strong> A brilliant mathematician who, despite knowing all options, wants only to count blades of grass in their backyard.',
          '<strong>Core problem:</strong> These people desire the \u201cwrong\u201d things, but the Desire Theory can\u2019t explain what makes them wrong without admitting desire-independent goods.',
        ],
      },
      {
        type: 'concept',
        title: 'How Exam Cases Distinguish the Three Theories',
        body: '<p>Exam questions often describe a case and ask <strong>which theory best explains the verdict</strong>.</p><p><strong>Hedonism:</strong> if one life has more pleasure and less pain, it is better. So if someone says Deception is better than Honesty just because it feels better from the inside, that points to hedonism.</p><p><strong>Desire Theory:</strong> what matters is whether the person\u2019s desires are actually fulfilled. This is why it can say Anna should plug into the experience machine if she only wants pleasure. But it also implies that serving the master is good for the oppressed slave if that is their only desire \u2014 which is the problem.</p><p><strong>Objective List Theory:</strong> things like knowledge, autonomy, friendship, and achievement can be good for a person whether or not they want them. So if someone says Deception is worse because the mother lacks knowledge, that points to an objective list theory.</p>',
      },
      {
        type: 'concept',
        title: 'Theory 3: Objective List Theories',
        body: '<p><strong>Objective List Theories</strong> hold that there are things that are <strong>objectively</strong> non-instrumentally good for a person \u2014 whether they desire them or not.</p><p>Popular items on the list include: <strong>knowledge, autonomy, friendship, achievement, pleasure</strong>. Usually there are multiple items (so hedonism is not typically an objective list theory).</p><p><strong>Attractions:</strong> Explains why we shouldn\u2019t plug into the experience machine. Explains why fulfilling some desires (like the grass-counter\u2019s) isn\u2019t good for the person.</p><p><strong>Objections:</strong> It\u2019s <em>elitist</em> \u2014 claiming things are good for people even if they don\u2019t want them. And it\u2019s hard to explain what all the items on the list have in common.</p>',
      },
      {
        type: 'check',
        q: 'Anna wants only pleasure and decides to spend her entire life in the experience machine. Three philosophers react: A says she\u2019s right AND it would be right for everyone. B says she\u2019s wrong. C says she\u2019s right, but it wouldn\u2019t be right for many others. Which theory does each endorse?',
        a: '<strong>A = Hedonist</strong> (pleasure is all that matters, everyone should plug in). <strong>B = Objective List Theorist</strong> (some objectively good things like genuine knowledge/friendship can\u2019t be obtained in the machine). <strong>C = Desire Theorist</strong> (Anna only desires pleasure, so she\u2019s right \u2014 but most people have other desires that can\u2019t actually be fulfilled in the machine).',
      },
      {
        type: 'check',
        q: 'On the Desire Theory, is it possible that a person doesn\u2019t know how valuable their life is?',
        a: '<strong>Yes.</strong> If a person doesn\u2019t know whether their desires have been fulfilled, they can\u2019t know how valuable their life is. E.g., a mother who desires her missing child\u2019s safety but doesn\u2019t know if the child is safe.',
      },
      {
        type: 'check',
        q: 'Which of Nozick\u2019s conclusions is most accurate? (a) Pleasure is only instrumentally valuable. (b) Pleasure is not the only thing that is non-instrumentally valuable.',
        a: '<strong>(b)</strong> Nozick\u2019s point is that pleasure is <strong>not the only</strong> thing that is non-instrumentally valuable. He does NOT claim pleasure has no non-instrumental value at all \u2014 just that there must be something else that matters too.',
      },
      {
        type: 'check',
        q: 'What is the BEST valid logical form for Nozick\'s Experience Machine argument?',
        a: '<strong>Modus Tollens:</strong> P1. If nothing matters besides how our lives feel from the inside, we would plug into the experience machine. P2. We would NOT plug in. C. Therefore, it is NOT the case that nothing matters besides how our lives feel.<br><br>The conclusion is <strong>not</strong> "experience/pleasure doesn\'t matter" — it is "experience is <strong>not the only thing</strong> that matters."',
      },
      {
        type: 'check',
        q: 'Darren\'s mother\'s only desire is to see Darren married before she dies. In Deception, Darren lies; she is happier but has false beliefs. In Honesty, she knows the truth and is unhappier. Eric says her life has less non-instrumental value in Deception. Which theory of non-instrumental value does Eric most likely hold, and why?',
        a: '<strong>Objective List Theory.</strong> Eric is not a hedonist (hedonists would say Deception is better — more pleasure). He is not a desire theorist (her desire is unfulfilled in both scenarios, so equal value). He must be an objective list theorist who thinks <strong>knowledge</strong> (or contact with reality) is objectively valuable — and she lacks genuine knowledge in Deception.',
      },
      {
        type: 'check',
        q: 'Why is the “oppressed slave who only wants to serve the master” a problem for the Desire Theory?',
        a: '<strong>Because the Desire Theory implies that serving the master is good for the slave.</strong> If desire-fulfilment is the only non-instrumental good, then fulfilling that desire makes the slave’s life go better. But that seems deeply wrong, which suggests that what is good for a person cannot depend only on whatever they happen to desire.',
      },
      {
        type: 'summary',
        title: 'Week 2 \u2014 Key Takeaways',
        points: [
          'Instrumental goods are means to ends; non-instrumental goods are good for their own sake',
          'Hedonism: only pleasure is non-instrumentally good. Challenged by the Experience Machine.',
          'Desire Theory: only desire fulfillment is non-instrumentally good. Challenged by \u201cwrong\u201d desires.',
          'Objective List Theories: multiple things are objectively good. Challenged as elitist.',
          'Nozick\u2019s Experience Machine: most wouldn\u2019t plug in, suggesting we value more than just experience.',
        ],
        cta: 'Ready to test yourself on Week 2? Head to Week 3 next.',
      },
    ],
  },

  // ══════════════════════════════════════════════
  // WEEK 3 — Right & Wrong I
  // ══════════════════════════════════════════════
  {
    id: 'week3',
    title: 'Week 3',
    subtitle: 'Right & Wrong I: Consequentialism & Singer',
    icon: '\u2696\uFE0F',
    slides: [
      {
        type: 'intro',
        week: 'Week 3 \u2014 Right & Wrong I',
        question: 'What makes an action morally right or wrong?',
        body: 'This lesson introduces consequentialism (specifically classic utilitarianism) and Peter Singer\u2019s argument that we are morally obligated to help people in extreme poverty.',
      },
      {
        type: 'bullets',
        title: 'Moral Terminology',
        items: [
          '<strong>Morally wrong (impermissible):</strong> Actions you must not do.',
          '<strong>Morally right (permissible):</strong> Actions that are not wrong.',
          '<strong>Morally required (obligatory):</strong> Actions that are wrong NOT to do. (A subset of permissible actions.)',
          '<strong>Supererogatory:</strong> Morally good but not required \u2014 going above and beyond one\u2019s moral duties (e.g., jumping on a grenade to save others).',
          '<strong>Morally neutral:</strong> Neither required nor wrong (e.g., eating ice cream for breakfast).',
        ],
      },
      {
        type: 'term',
        label: 'Key Theory',
        term: 'Consequentialism',
        def: 'Whether an act is morally right or wrong depends <strong>ONLY</strong> on its consequences. Everything else \u2014 intention, motive, etc. \u2014 is irrelevant. Different forms of consequentialism differ on what kinds of consequences matter.',
      },
      {
        type: 'concept',
        title: 'Classic Utilitarianism',
        body: '<p><strong>Classic utilitarianism</strong> says: a right action is one that <strong>maximizes total net pleasure</strong> (total pleasure minus total pain for everyone affected by the action).</p><p>Key features: <strong>Impartial</strong> \u2014 anyone\u2019s pleasure counts equally (regardless of class, gender, race, species). <strong>Demanding</strong> \u2014 only the action that maximizes net pleasure is right; all others are wrong. <strong>Context-sensitive</strong> \u2014 no type of action (torture, robbery) is always wrong; it depends on whether it maximizes net pleasure in that context.</p><p>On classic utilitarianism, the categories of morally permissible and morally required actions <strong>collapse</strong> \u2014 there is essentially no room for supererogatory actions.</p>',
      },
      {
        type: 'concept',
        title: 'Moral Status on Classic Utilitarianism',
        body: '<p>Exam questions often ask whether an action is <strong>permissible, required, neutral, supererogatory, or wrong</strong>.</p><p><strong>Main rule:</strong> any action that <strong>maximizes</strong> total net pleasure is right/permissible. If there is <strong>only one</strong> such action, it is also <strong>morally required</strong>. Any action that produces less net pleasure than the best available action is <strong>wrong</strong>.</p><p><strong>Important consequence:</strong> classic utilitarianism leaves almost no room for <strong>supererogatory</strong> or <strong>morally neutral</strong> actions in choice situations. If one option is best, that option is required and the rest are wrong. If several options tie for best, each tied option is permissible.</p><p><strong>Another trap:</strong> an action can still be right even if it produces only pain, as long as every other available action produces even more pain.</p>',
      },
      {
        type: 'bullets',
        title: 'Why \u201cGreatest Happiness for Greatest Number\u201d Is Misleading',
        items: [
          '<strong>Pain matters too:</strong> It\u2019s total net pleasure (pleasure MINUS pain), not just pleasure.',
          '<strong>Numbers can be misleading:</strong> An action benefiting fewer people can be right if it produces more total net pleasure. E.g., 1 person gets 50 pleasure; 9 others get 1 pain each = 41 net. Better than 10 people each getting 1 pleasure = 10 net.',
          '<strong>MCQ trap:</strong> An action producing more pleasure than pain is NOT necessarily right \u2014 it must produce MORE net pleasure than any other available action.',
        ],
      },
      {
        type: 'concept',
        title: 'Singer: Famine, Affluence, and Morality',
        body: '<p>Peter Singer argues that people in affluent countries are <strong>morally obligated</strong> to donate a significant amount of money to help people suffering from extreme poverty. This is <strong>not supererogatory</strong> \u2014 it is morally wrong not to do so.</p><p>Singer claims his argument does <strong>not rely on utilitarianism</strong>. He uses the <strong>Drowning Child</strong> analogy: if you walk past a shallow pond and see a child drowning, you ought to save them even if it means ruining your clothes. Singer then argues there is no morally relevant difference between this and helping distant people in poverty.</p>',
      },
      {
        type: 'bullets',
        title: 'Singer\u2019s Argument',
        items: [
          '<strong>Premise 1:</strong> We ought to save the drowning child.',
          '<strong>Premise 2:</strong> If we ought to save the drowning child, then we ought to help people dying from extreme poverty in developing countries (no morally relevant differences).',
          '<strong>Conclusion:</strong> We ought to help people dying from extreme poverty. It is morally wrong not to.',
          '<strong>Key rebuttals Singer addresses:</strong> Physical distance is psychologically but not morally relevant. The number of others who could help does not lessen YOUR obligation.',
        ],
      },
      {
        type: 'concept',
        title: 'Singer\u2019s Two Versions',
        body: '<p><strong>Strong version:</strong> We ought to prevent as much suffering as we can without sacrificing something of <em>comparable</em> moral importance.</p><p><strong>Moderate version:</strong> We ought to prevent bad occurrences unless, to do so, we had to sacrifice something <em>morally significant</em>.</p><p>Even the moderate version is <strong>very demanding:</strong> buying new clothes, bottled water, etc. when that money could prevent suffering is morally wrong.</p><p><strong>Important:</strong> Even the strong version only concerns <em>reducing suffering</em>, not maximizing total happiness. So Singer (in this paper) can still allow for supererogatory actions like making already-happy people happier.</p>',
      },
      {
        type: 'bullets',
        title: 'Strong vs. Moderate: What Actually Changes?',
        items: [
          '<strong>Strong version:</strong> You keep giving until giving more would require sacrificing something of <em>comparable</em> moral importance. This demands more from you.',
          '<strong>Moderate version:</strong> You may stop earlier \u2014 once further giving would require sacrificing something morally significant.',
          '<strong>Both versions:</strong> are about <strong>reducing suffering</strong>, not maximizing total happiness.',
          '<strong>Both versions:</strong> still allow some supererogatory actions. Making already-happy people even happier can go beyond what Singer\u2019s principle requires.',
        ],
      },
      {
        type: 'quote',
        label: 'Peter Singer \u2014 \u201cFamine, Affluence, and Morality\u201d (1972)',
        text: '\u201cThe fact that a person is physically near to us, so that we have personal contact with him, may make it more likely that we shall assist him, but this does not show that we ought to help him rather than another who happens to be further away.\u201d',
        source: '<strong>Peter Singer</strong> \u2014 <em>Philosophy & Public Affairs</em>, Vol. 1, No. 3, p. 232',
      },
      {
        type: 'check',
        q: 'You have two actions. Action A: 2 units of pleasure (no pain) for a cat. Action B: 1 unit of pleasure (no pain) for a human. Which is right on classic utilitarianism, assuming same amount and quality?',
        a: '<strong>Action A.</strong> Classic utilitarianism is impartial \u2014 anyone\u2019s (including an animal\u2019s) pleasure counts equally if it is of the same amount and quality. Action A produces more total net pleasure.',
      },
      {
        type: 'check',
        q: 'An action generates 10 units of pleasure and 10 units of pain. Is it morally permissible on classic utilitarianism?',
        a: '<strong>We need more information.</strong> Classic utilitarianism says the right action is the one that maximizes total net pleasure among all available actions. We need to know what the other available actions produce. If all alternatives produce less than 0 net pleasure, this action could be right.',
      },
      {
        type: 'check',
        q: 'A philosopher responds to Singer: \u201cWhether a person is physically near to us makes a difference in whether we ought to help them.\u201d Which premise is this philosopher denying?',
        a: '<strong>Premise 2</strong> (if we ought to save the drowning child, then we ought to help people in extreme poverty). This philosopher claims a morally relevant difference exists between the cases. This also means the philosopher is claiming the argument is <strong>unsound</strong> (but NOT invalid \u2014 the logical structure is still valid).',
      },
      {
        type: 'check',
        q: 'Moonyoung already owns enough shoes. She buys a cheaper pair for $50 and donates $50 to a malaria charity instead of buying the $100 shoes she wanted. What would Singer say?',
        a: '<strong>Her action is morally wrong.</strong> She is still spending $50 on shoes she doesn\u2019t need when that money could prevent suffering. Even if everyone else in her situation donated $50 and that would eliminate malaria, Singer says (p. 233) that the hypothetical \u201cif everyone gave\u201d does not reduce her actual obligation since not everyone WILL give.',
      },
      {
        type: 'check',
        q: 'True or false: Singer\'s strong version of his principle requires us to maximise total net happiness.',
        a: '<strong>False.</strong> Neither the strong nor moderate version is about maximising happiness. Both are about <strong>reducing suffering</strong>. The strong version only requires preventing suffering up to the point where you\'d be sacrificing something of comparable moral importance. If people in developing countries were already happy (not suffering), neither version would require us to make them even happier. Both versions also allow supererogatory actions — e.g., making already-happy people even happier goes beyond what either version requires.',
      },
      {
        type: 'check',
        q: 'True or false: If an action is supererogatory, then it is morally permissible.',
        a: '<strong>True.</strong> Supererogatory actions go above and beyond duty. That means they are morally good but not required \u2014 so they must be permissible rather than wrong.',
      },
      {
        type: 'summary',
        title: 'Week 3 \u2014 Key Takeaways',
        points: [
          'Consequentialism: only consequences determine rightness. Classic utilitarianism: maximize total net pleasure.',
          'Classic utilitarianism is impartial, demanding, and context-sensitive. No action type is always wrong.',
          'On classic utilitarianism, morally required \u2248 morally permissible (very little room for supererogation).',
          'Singer: we are morally obligated to help people in extreme poverty. Not charity \u2014 duty.',
          'Distance and the number of others in the same position do not lessen our moral obligations.',
        ],
        cta: 'Next week: non-consequentialism, Kant, and the Trolley Problem.',
      },
    ],
  },

  // ══════════════════════════════════════════════
  // WEEK 4 — Right & Wrong II
  // ══════════════════════════════════════════════
  {
    id: 'week4',
    title: 'Week 4',
    subtitle: 'Right & Wrong II: Non-Consequentialism & Trolley Problems',
    icon: '\uD83D\uDE83',
    slides: [
      {
        type: 'intro',
        week: 'Week 4 \u2014 Right & Wrong II',
        question: 'Is it ONLY consequences that matter? Or do some actions have moral weight in themselves?',
        body: 'This lesson covers non-consequentialism, Kant\u2019s \u201cmerely as a means\u201d principle, Foot\u2019s killing vs. letting die distinction, and Thomson\u2019s argument that the bystander should NOT throw the switch.',
      },
      {
        type: 'term',
        label: 'Key Theory',
        term: 'Non-Consequentialism',
        def: 'It is <strong>NOT</strong> the case that whether an act is morally right or wrong depends only on consequences. Some non-consequentialists think consequences are irrelevant; others think consequences are one of several relevant factors. Kant is the most famous non-consequentialist.',
      },
      {
        type: 'concept',
        title: 'The Three Trolley Cases',
        body: '<p><strong>Driver:</strong> A runaway trolley is heading toward 5 people. The driver can steer onto a side-track, killing 1 instead. <em>Common intuition: Option 2 (kill 1) is permissible.</em></p><p><strong>Bystander:</strong> A bystander can throw a switch to divert the trolley onto a side-track, killing 1 instead of 5. <em>Common intuition: Option 2 is permissible.</em></p><p><strong>Bridge (Fat Man):</strong> A bystander on a footbridge can push a large person onto the track, stopping the trolley but killing that person. <em>Common intuition: Option 2 is NOT permissible.</em></p><p><strong>Utilitarians</strong> say Option 2 is permissible (in fact, required) in <strong>all three cases</strong> \u2014 just look at consequences (1 death < 5 deaths).</p>',
      },
      {
        type: 'concept',
        title: 'Kant: Treating Persons Merely as a Means',
        body: '<p><strong>Kant\u2019s principle:</strong> It is morally wrong to treat persons <strong>merely as a means</strong>.</p><p>Using someone as a means = their involvement is part of the route by which your plan succeeds (you can\u2019t achieve your goal if the person disappears).</p><p><strong>Driver & Bystander:</strong> You\u2019re not even treating the person as a means \u2014 you can still save the five even if the one person disappears. So Kant doesn\u2019t prohibit Option 2.</p><p><strong>Bridge:</strong> You ARE treating the person as a means (and probably merely as a means) \u2014 you need their body to stop the trolley. So Kant says Option 2 is wrong.</p><p><strong>Challenge: The Loop Case.</strong> A variant of Bystander where the side-track loops back, and the one person\u2019s body stops the trolley. Many think it\u2019s still permissible, but now you ARE using the person as a means.</p>',
      },
      {
        type: 'concept',
        title: 'Foot: Killing vs. Letting Die',
        body: '<p><strong>Philippa Foot\u2019s principle:</strong> Killing is morally worse than letting die.</p><p><strong>Bridge:</strong> Option 1 = letting 5 die. Option 2 = killing 1. Letting die is less bad \u2192 choose Option 1 (don\u2019t push). This matches intuition.</p><p><strong>Driver:</strong> Option 1 = killing 5. Option 2 = killing 1. Both are killing, so kill fewer \u2192 choose Option 2 (steer). This matches intuition.</p><p><strong>Challenge: Bystander.</strong> Option 1 = letting 5 die. Option 2 = killing 1. By the same logic as Bridge, the bystander should let 5 die. But common intuition says the bystander MAY throw the switch!</p>',
      },
      {
        type: 'concept',
        title: 'Thomson: \u201cTurning the Trolley\u201d (2008)',
        body: '<p>Thomson agrees with Foot\u2019s killing/letting die distinction and argues the common intuition about Bystander is <strong>wrong</strong> \u2014 the bystander should <strong>NOT</strong> throw the switch.</p><p>Her argument uses <strong>Bystander\u2019s Three Options:</strong> imagine the switch can also divert the trolley onto the bystander himself. If he can save the five by killing himself (Option iii), how dare he instead kill someone else (Option ii)? Since most of us wouldn\u2019t kill ourselves, we can\u2019t \u201cdecently regard ourselves as entitled\u201d to make someone else pay the cost of our good deed.</p><p><strong>Key quote:</strong> \u201cSince he wouldn\u2019t himself pay the cost of his good deed if he could pay it, there is no way in which he can decently regard himself as entitled to make someone else pay it.\u201d</p>',
      },
      {
        type: 'bullets',
        title: 'Thomson\u2019s Argument (Formal)',
        items: [
          '<strong>P1:</strong> It is morally wrong to turn the trolley onto another person in Bystander\u2019s Three Options (because you should pay the cost yourself if you can).',
          '<strong>P2:</strong> If it is morally wrong in Three Options, it is morally wrong in Two Options (since you wouldn\u2019t pay the cost yourself if you could).',
          '<strong>Conclusion:</strong> It is morally wrong for the bystander to throw the switch in the original Bystander case.',
          '<strong>Why intuition misleads:</strong> The means in Bystander (merely turning a trolley) seems so non-drastic that we overlook the fact that the bystander is still killing someone.',
        ],
      },
      {
        type: 'bullets',
        title: 'Summary: Who Says What?',
        items: [
          '<strong>Classic utilitarians:</strong> Option 2 is permissible (required) in ALL cases. Common intuitions are unreliable.',
          '<strong>Kant:</strong> Bridge is wrong (using person merely as a means). Driver & Bystander are okay. Loop is a problem.',
          '<strong>Foot:</strong> Bridge is wrong (killing > letting die). Driver is okay (killing fewer). Bystander is a problem.',
          '<strong>Thomson:</strong> Bridge AND Bystander are wrong (killing > letting die). Driver is okay. The \u201ctrolley problem\u201d is a non-problem.',
        ],
      },
      {
        type: 'concept',
        title: 'Exam Move: Same Structure, Same Verdict',
        body: '<p>Past exams repeatedly test whether you can apply Thomson\u2019s view to a <strong>new case</strong> by asking whether its structure matches Driver, Bystander, or Bridge.</p><p><strong>Driver structure:</strong> kill one vs kill five. Foot and Thomson say kill one. <strong>Bystander structure:</strong> kill one vs let five die. Foot and Thomson say let five die. <strong>Bridge structure:</strong> also kill one vs let five die, so Thomson treats it the same as Bystander; the \u201cdrastic\u201d nature of the means does not matter morally.</p><p>This is why a <strong>boulder case</strong> where pushing the boulder kills one innocent bystander but the bystander\u2019s body is not needed as a means still comes out like Bystander for Thomson: it is still <strong>killing one instead of letting five die</strong>, so she says it is wrong.</p>',
      },
      {
        type: 'check',
        q: 'TRUE or FALSE: According to Kant (as interpreted in class), Option 2 amounts to treating a person merely as a means in both Bystander and Bridge.',
        a: '<strong>FALSE.</strong> In Bystander, you\u2019re not even treating the person as a means (you can achieve your aim of saving five even if the person on the side track disappears). In Bridge, you ARE treating the person as a means (you need their body to stop the trolley).',
      },
      {
        type: 'check',
        q: 'TRUE or FALSE (assume Thomson is right): If you don\u2019t need another person to achieve your aim, then you\u2019re not killing the person.',
        a: '<strong>FALSE.</strong> In Bystander, you don\u2019t need the person on the side track to achieve your aim (saving the five). But by throwing the switch, you ARE still killing them according to Thomson. Not needing them as a means doesn\u2019t mean you aren\u2019t killing them.',
      },
      {
        type: 'check',
        q: 'Both classic utilitarians and Thomson think the common intuition about the Bystander case is wrong. True or false? Why?',
        a: '<strong>TRUE</strong>, but for opposite reasons. <strong>Utilitarians</strong> think Option 2 is permissible in ALL cases (Bystander AND Bridge) \u2014 so the intuition that Bridge is wrong is mistaken. <strong>Thomson</strong> thinks Option 2 is impermissible in ALL cases (Bystander AND Bridge) \u2014 so the intuition that Bystander is permissible is mistaken.',
      },
      {
        type: 'check',
        q: 'In the Loop case: (a) Are you treating the one person as a means? (b) What would Thomson probably say? (c) What would classic utilitarians say?',
        a: '<strong>(a) Yes</strong> \u2014 if the person disappears, you can\u2019t save the five (the trolley goes around the loop). <strong>(b) Thomson would say it\u2019s morally wrong</strong> to throw the switch (she already thinks it\u2019s wrong in regular Bystander; Loop adds even more reason since you\u2019re using the person as a means). <strong>(c) Utilitarians would say it\u2019s permissible</strong> \u2014 more lives saved, and only consequences matter.',
      },
      {
        type: 'check',
        q: 'In the Transplant case, a surgeon can save 5 patients only by cutting up one healthy bystander. (a) Is the surgeon treating the bystander as a means? (b) What would Kant say? (c) What would Foot say?',
        a: '<strong>(a) Yes</strong> — the bystander\'s organs are the route to success; if the bystander disappeared, the plan fails. <strong>(b) Kant\'s key point:</strong> treating someone as a means is NOT always wrong — treating someone <em>merely</em> as a means is. Still, cutting someone up likely treats them merely as a means, which Kant would condemn. <strong>(c) Foot: it\'s morally wrong</strong> — cutting up = killing; not operating = letting the five die. Since killing is worse than letting die, the surgeon must not operate.',
      },
      {
        type: 'check',
        q: 'Suppose the only way to save five is to push a heavy boulder onto the track, and the boulder will crush one innocent bystander. The bystander\u2019s body plays no role in stopping the trolley. What would Thomson likely say?',
        a: '<strong>She would still say it is morally wrong</strong>. Even though the bystander is not being used as a means, pushing the boulder still counts as <strong>killing one person</strong>, while not pushing it counts as <strong>letting five die</strong>. That gives the case the same moral structure as Bystander on Thomson\u2019s view.',
      },
      {
        type: 'check',
        q: 'True or false: Both Thomson and classic utilitarianism treat the moral difference between Bridge and Bystander as irrelevant.',
        a: '<strong>True.</strong> Both agree the Bridge/Bystander difference doesn\'t matter morally, but they reach opposite conclusions. <strong>Utilitarians:</strong> only consequences matter; the method (push vs. flip switch) doesn\'t affect consequences, so both are equally permissible. <strong>Thomson:</strong> "how drastic the means is" is morally irrelevant; what matters is that both cases involve killing one to let five live — so both are equally wrong.',
      },
      {
        type: 'check',
        q: 'Give an example for each of the four combinations: (a) killing + treating as means, (b) killing without treating as means, (c) treating as means without killing, (d) neither killing nor treating as means.',
        a: '<strong>(a) Bridge:</strong> pushing the large person kills them AND uses their body to stop the trolley. <strong>(b) Bystander:</strong> throwing the switch kills the person on the side track, but they are NOT needed as a means (if they disappeared, the five would still be saved). <strong>(c) Bus driver / lying:</strong> you use the driver to get somewhere (treating as means) but don\'t kill them. <strong>(d) Not interacting with another person at all.</strong>',
      },
      {
        type: 'summary',
        title: 'Week 4 \u2014 Key Takeaways',
        points: [
          'Non-consequentialism: consequences aren\u2019t the only thing that matters morally.',
          'Kant: wrong to treat persons merely as a means. Explains Bridge but not Loop.',
          'Foot: killing is worse than letting die. Explains Bridge and Driver but not Bystander.',
          'Thomson: bystander should NOT throw the switch \u2014 if you wouldn\u2019t pay the cost yourself, you can\u2019t make someone else pay it.',
          'Utilitarians and Thomson BOTH reject common intuitions, but from opposite sides.',
        ],
        cta: 'Next week: logical reasoning and cultural relativism.',
      },
    ],
  },

  // ══════════════════════════════════════════════
  // WEEK 5 — Logical Reasoning & Cultural Relativism
  // ══════════════════════════════════════════════
  {
    id: 'week5',
    title: 'Week 5',
    subtitle: 'Logical Reasoning & Cultural Relativism',
    icon: '\uD83E\uDDE0',
    slides: [
      {
        type: 'intro',
        week: 'Week 5 \u2014 Logical Reasoning & Cultural Relativism',
        question: 'What makes a good argument? Are there objective truths in ethics?',
        body: 'This is probably the most difficult and most important content in the course. We cover validity, soundness, the four argument forms, and Rachels\u2019 critique of cultural relativism.',
      },
      {
        type: 'concept',
        title: 'What Is an Argument?',
        body: '<p>An <strong>argument</strong> is a series of statements where the last statement (<strong>conclusion</strong>) is supposedly supported by the other statements (<strong>premises</strong>).</p><p>Example: P1. All humans are mortal. P2. Socrates is a human. C. Therefore, Socrates is mortal.</p><p>In <strong>deductive</strong> arguments (the only kind we study), the premises are supposed to <strong>guarantee</strong> the truth of the conclusion. Other types of arguments (inductive) only make the conclusion <em>likely</em>.</p>',
      },
      {
        type: 'term',
        label: 'Key Concept',
        term: 'Validity',
        def: 'A <strong>valid</strong> argument: if the premises are all true, the conclusion <strong>must</strong> be true. The premises guarantee the conclusion. It doesn\u2019t matter whether the premises are <em>actually</em> true.<br><br><strong>How to check:</strong> Assume all premises are true. Is it <em>possible</em> for the conclusion to be false? If yes \u2192 <strong>invalid</strong>. If no \u2192 <strong>valid</strong>.<br><br>An argument with all false premises and a false conclusion <strong>can still be valid</strong> (e.g., the Taylor Swift argument).',
      },
      {
        type: 'term',
        label: 'Key Concept',
        term: 'Soundness',
        def: 'A <strong>sound</strong> argument = a <strong>valid</strong> argument + <strong>all premises are true</strong>.<br><br>If an argument is sound, its conclusion <strong>must be true</strong>. This is why soundness matters.<br><br><strong>Important:</strong> An argument with all true premises and a true conclusion can still be <strong>unsound</strong> \u2014 if it\u2019s <em>invalid</em> (e.g., the Edward Cullen argument).',
      },
      {
        type: 'bullets',
        title: 'The Four Common Argument Forms',
        items: [
          '<strong>(1) Always VALID \u2014 Modus Ponens:</strong> If A, then B. A. Therefore, B. (Affirming the antecedent.)',
          '<strong>(2) Always VALID \u2014 Modus Tollens:</strong> If A, then B. Not B. Therefore, Not A. (Denying the consequent.)',
          '<strong>(3) Always INVALID:</strong> If A, then B. Not A. Therefore, Not B. (Denying the antecedent. TRAP: looks tempting but always invalid!)',
          '<strong>(4) Always INVALID:</strong> If A, then B. B. Therefore, A. (Affirming the consequent. TRAP: e.g., \u201cif cold then sick; I\u2019m sick; therefore I have a cold\u201d \u2014 could be any illness.)',
        ],
      },
      {
        type: 'concept',
        title: 'Practice: Identifying Argument Forms',
        body: '<p><strong>Example 1:</strong> P1. If the death penalty deters crime, it is justified. P2. The death penalty does NOT deter crime. C. Therefore, it is NOT justified.</p><p>This is form <strong>(3) \u2014 INVALID</strong>. \u201cIf A then B; not A; therefore not B.\u201d The death penalty might be justified for other reasons.</p><p><strong>Example 2:</strong> P1. If my crush is interested, they will text me. P2. My crush just texted me. C. My crush is interested.</p><p>This is form <strong>(4) \u2014 INVALID</strong>. \u201cIf A then B; B; therefore A.\u201d They might have texted for other reasons.</p><p><strong>Key insight:</strong> An invalid argument does NOT mean the conclusion is false. It just means THIS argument fails to show the conclusion is true. There might be other, valid arguments for it.</p>',
      },
      {
        type: 'term',
        label: 'Key Theory',
        term: 'Cultural Relativism',
        def: 'The truth of moral judgments is <strong>relative to a culture or society</strong>. The moral code of a society determines what is right or wrong within that society. There is no universal truth in ethics \u2014 only various cultural codes, and our own code has no special status.<br><br>According to cultural relativism, moral statements like \u201cyou should not kill your baby\u201d are <strong>similar to</strong> \u201cyou should drive on the left side of the road\u201d \u2014 true in some societies, false in others.',
      },
      {
        type: 'concept',
        title: 'Rachels: The Cultural Differences Argument Is Invalid',
        body: '<p>Cultural relativists often argue: \u201cDifferent cultures have different moral codes. Therefore, there is no objective truth in morality.\u201d Rachels shows this argument is <strong>invalid</strong>.</p><p>The premise is about what people <strong>believe</strong>. The conclusion is about what <strong>really is the case</strong>. The conclusion doesn\u2019t follow from the premise.</p><p><strong>Analogy:</strong> Some societies believe the earth is flat; others that it\u2019s round. Does it follow that there\u2019s no objective truth in geography? Of course not \u2014 some societies might simply be wrong.</p><p>Showing this argument is invalid does NOT show cultural relativism is false \u2014 it just shows this particular argument fails.</p>',
      },
      {
        type: 'concept',
        title: 'Rachels: Three Consequences That Make Cultural Relativism Implausible',
        body: '<p>Rachels argues AGAINST cultural relativism using <strong>Modus Tollens</strong> (form 2): \u201cIf cultural relativism is true, then [bad consequence]. [Bad consequence] is false. Therefore, cultural relativism is not true.\u201d</p><p><strong>Consequence 1:</strong> We could never say other societies\u2019 customs are morally inferior \u2014 not even slavery or the Holocaust.</p><p><strong>Consequence 2:</strong> We could decide right/wrong just by consulting our own society\u2019s standards \u2014 no criticizing our own code.</p><p><strong>Consequence 3:</strong> Moral progress would be impossible \u2014 we can\u2019t say women\u2019s rights represent \u201cprogress\u201d because the old standards were correct for their time.</p><p><strong>Bonus consequence:</strong> Cultural relativism may not even support tolerance \u2014 if your culture\u2019s code says \u201cbe intolerant,\u201d then intolerance is morally right in your culture.</p>',
      },
      {
        type: 'quote',
        label: 'James Rachels \u2014 \u201cThe Challenge of Cultural Relativism\u201d',
        text: '\u201cCultural Relativism begins with the valuable insight that many of our practices are like this \u2014 they are only cultural products. Then it goes wrong by concluding that, because some practices are like this, all must be.\u201d',
        source: '<strong>James Rachels</strong> (1941\u20132003) \u2014 <em>The Elements of Moral Philosophy</em>, Ch. 2, p. 23',
      },
      {
        type: 'check',
        q: 'Fill in the blank so the argument becomes VALID: P1. Different cultures have different moral codes. P2. [____]. C. Cultural relativism is true. Options: (A) If different cultures have different moral codes, cultural relativism is true. (B) If cultural relativism is true, different cultures have different moral codes.',
        a: '<strong>(A) only.</strong> With (A) you get Modus Ponens (form 1): If A then B; A; therefore B \u2014 valid. With (B) you get form 4: If B then A; A; therefore B \u2014 always invalid.',
      },
      {
        type: 'check',
        q: 'TRUE or FALSE: An argument with all false premises and a false conclusion can still be valid.',
        a: '<strong>TRUE.</strong> Validity is about the logical connection between premises and conclusion \u2014 if the premises WERE true, the conclusion MUST be true. The actual truth values don\u2019t matter for validity. Example: \u201cIf Taylor Swift is a philosopher, then 2+2=5. Taylor Swift is a philosopher. Therefore, 2+2=5.\u201d \u2014 Valid (Modus Ponens), just not sound.',
      },
      {
        type: 'check',
        q: 'TRUE or FALSE: If an argument\u2019s premises and conclusion are all true, the argument is sound.',
        a: '<strong>FALSE.</strong> Soundness requires validity AND true premises. An argument can have all true statements but be invalid (and therefore unsound). Example: \u201cIf vampires exist, they are immortal (true). Edward Cullen is immortal (true). Therefore, Edward Cullen is a vampire (true).\u201d \u2014 Form 4, always invalid, therefore unsound.',
      },
      {
        type: 'check',
        q: 'According to cultural relativism, which is true? (A) Every culture ought to be tolerant. (B) A person can never do something morally wrong within their own culture. (C) None of the above.',
        a: '<strong>(C) None of the above.</strong> (A) is false because cultural relativism allows a culture\u2019s own code to be intolerant \u2014 there\u2019s no universal rule of tolerance. (B) is false because a person CAN violate their own culture\u2019s moral code, which would be morally wrong within that culture.',
      },
      {
        type: 'check',
        q: 'How do you PROVE that an argument is invalid? Is it enough to show that a premise is false? That the conclusion is false?',
        a: '<strong>No.</strong> Showing false premises or a false conclusion does NOT prove invalidity. A valid argument can have false premises, a false conclusion, or even all false statements. To prove invalidity, you must show that it is <strong>possible for all premises to be true while the conclusion is false at the same time</strong>. This is the only method.',
      },
      {
        type: 'check',
        q: 'A cultural relativist (Samantha) responds to Rachels\' argument that cultural relativism implies moral progress is impossible. She distinguishes between a society\'s common practices and its underlying ideals. How does this help her deny that moral progress is impossible?',
        a: 'Samantha denies P1 (that if CR is true, moral progress is impossible). She argues that even on cultural relativism, a society can improve morally: when a society fails to live up to its own ideals, and then succeeds in living up to them, that counts as moral progress. This redefines progress in culturally relative terms — progress toward the society\'s own standards — rather than requiring universal standards.',
      },
      {
        type: 'summary',
        title: 'Week 5 \u2014 Key Takeaways',
        points: [
          'Valid argument: if premises are true, conclusion MUST be true. Sound = valid + all premises true.',
          'Four forms: (1) Modus Ponens (valid), (2) Modus Tollens (valid), (3) Denying antecedent (INVALID), (4) Affirming consequent (INVALID).',
          'An invalid argument does not prove the conclusion is false \u2014 just that THIS argument fails.',
          'Cultural Differences Argument (different codes \u2192 no objective morality) is INVALID.',
          'Rachels: if cultural relativism is true, we can\u2019t condemn slavery, can\u2019t criticize our own society, and can\u2019t have moral progress.',
        ],
        cta: 'This content is heavily tested on the midterm. Practice identifying the four argument forms!',
      },
    ],
  },

  // ══════════════════════════════════════════════
  // WEEK 6 — Religion: The Problem of Evil
  // ══════════════════════════════════════════════
  {
    id: 'week6',
    title: 'Week 6',
    subtitle: 'Religion: The Problem of Evil',
    icon: '\uD83C\uDF0C',
    slides: [
      {
        type: 'intro',
        week: 'Week 6 \u2014 Religion',
        question: 'If an all-perfect God exists, why is there so much suffering in the world?',
        body: 'This lesson covers the Problem of Evil \u2014 the main argument against the existence of an all-perfect God \u2014 and six theodicies (responses by theists).',
      },
      {
        type: 'term',
        label: 'Key Concept',
        term: 'All-Perfect God',
        def: 'A god with three features: <strong>Omnipotent</strong> (all-powerful), <strong>Omniscient</strong> (all-knowing), and <strong>Omnibenevolent</strong> (all-loving, morally perfect). The Problem of Evil specifically targets the existence of this kind of god.',
      },
      {
        type: 'concept',
        title: 'The Problem of Evil \u2014 First Attempt',
        body: '<p><strong>P1.</strong> If an all-perfect god exists, there are no evils.<br><strong>P2.</strong> There are evils.<br><strong>C.</strong> An all-perfect god does not exist.</p><p>This argument is <strong>valid</strong> \u2014 it uses <strong>Modus Tollens</strong> (form 2): If A then B; not B; therefore not A.</p><p>But is it <strong>sound</strong>? P2 seems clearly true. The problem is <strong>P1</strong> \u2014 it\u2019s implausible because God may have <strong>good reasons</strong> to allow some evils.</p>',
      },
      {
        type: 'quote',
        label: 'Perry \u2014 Dialogue on Good, Evil, and the Existence of God',
        text: '\u201cJust as we have a plan for spending a fine day fishing that has, as a necessary part, a little suffering early in the morning, so God may have a plan for the world that requires suffering. It still may be a fine world, a much better world than it would have been without the suffering.\u201d',
        source: '<strong>Miller</strong> (character) \u2014 <em>Dialogue on Good, Evil, and the Existence of God</em>, p. 4, 9',
      },
      {
        type: 'concept',
        title: 'The Problem of Evil \u2014 Revised Version',
        body: '<p>To fix the implausible P1, we revise the argument:</p><p><strong>P1.</strong> If an all-perfect god exists, there are no <strong>unjustified</strong> evils (evils that God has no good reason to allow).<br><strong>P2.</strong> There ARE unjustified evils.<br><strong>C.</strong> An all-perfect god does not exist.</p><p>Still valid (Modus Tollens). P1 is now much more plausible. So theists typically <strong>attack P2</strong> by trying to show all evils in the world are justified \u2014 i.e., God has (or could have) good reasons to allow them.</p><p>An evil is \u201cjustified\u201d if allowing it is <strong>necessary</strong> for achieving a more important moral goal (even an all-perfect god can\u2019t achieve that goal without allowing the evil).</p>',
      },
      {
        type: 'bullets',
        title: 'Six Theodicies (Responses to the Problem of Evil)',
        items: [
          '<strong>1. Appreciation:</strong> We can\u2019t appreciate good without experiencing bad. <em>But: do we need THIS much evil? What about evil nobody knows about?</em>',
          '<strong>2. Spiritual development:</strong> Suffering promotes moral/personal growth. <em>But: suffering often makes people bitter and morally crippled, not better. What about children and animals who die young?</em>',
          '<strong>3. Free will:</strong> Evil is a necessary consequence of human free will. <em>But: what about natural evils (earthquakes, cancer)? Why doesn\u2019t God intervene in the worst cases? God/angels have free will and don\u2019t sin.</em>',
          '<strong>4. Supernatural beings:</strong> Natural evils are caused by devils/fallen angels with free will. <em>But: why doesn\u2019t God stop them?</em>',
          '<strong>5. Laws of nature:</strong> Natural evils are necessary consequences of having laws of nature, which enable effective human action. <em>But: couldn\u2019t God create better laws of nature? Or intervene undetectably?</em>',
          '<strong>6. Beyond human understanding:</strong> God has good reasons we can\u2019t comprehend. <em>But: then we lose our moral compass \u2014 we don\u2019t know what\u2019s truly good. And why doesn\u2019t a loving God help us understand?</em>',
        ],
      },
      {
        type: 'concept',
        title: 'The Fawn Example \u2014 The Hardest Case for Theists',
        body: '<p>Lightning strikes a tree in a remote forest, starting a wildfire. A fawn is badly burned and suffers for days before dying. This may have occurred before any humans existed.</p><p>This case is particularly challenging because:</p><p><strong>Theodicy 1 (appreciation):</strong> No one is around to appreciate anything. <strong>Theodicy 2 (spiritual development):</strong> No human benefits spiritually. <strong>Theodicy 3 (free will):</strong> No human chose this. <strong>Theodicies 4\u20135:</strong> Increasingly implausible responses. <strong>Theodicy 6:</strong> The \u201cwe can\u2019t understand\u201d response is always available but has its own severe costs.</p>',
      },
      {
        type: 'check',
        q: 'What valid argument form does the Problem of Evil use? Identify A and B.',
        a: '<strong>Modus Tollens (form 2):</strong> If A then B; not B; therefore not A. Here, A = \u201can all-perfect god exists,\u201d B = \u201cthere are no (unjustified) evils.\u201d P2 asserts \u201cnot B\u201d (there ARE unjustified evils). Conclusion: \u201cnot A\u201d (an all-perfect god does not exist).',
      },
      {
        type: 'check',
        q: 'Why is the first version of the Problem of Evil (P1: if God exists, there are no evils) not sound even though it\u2019s valid?',
        a: '<strong>P1 is false</strong> (or at least clearly implausible). An all-perfect god might have good reasons to allow SOME evils \u2014 e.g., allowing minor suffering that leads to greater goods (the fishing-trip analogy). The revised version fixes this by specifying \u201cno <strong>unjustified</strong> evils.\u201d',
      },
      {
        type: 'check',
        q: 'If a theist accepts Theodicy 6 (God\u2019s reasons are beyond human understanding), what problematic consequence follows?',
        a: 'We lose our <strong>moral compass</strong>: if we don\u2019t know what is truly good (in God\u2019s sense), we can\u2019t know whether to prevent suffering or not. We also can\u2019t predict God\u2019s behaviour \u2014 we have no reason to think our afterlife will be good (in our sense of good). And if God is all-loving, why doesn\u2019t he at least help us understand his reasons or make his presence more evident?',
      },
      {
        type: 'check',
        q: 'In Perry\'s Dialogue, Miller defends the "laws of nature" theodicy using the fishing-day analogy (getting up early is uncomfortable, but leads to a good day). What is Gretchen\'s deeper objection?',
        a: 'Gretchen points out that if God is all-powerful, God created the very <strong>dependencies and laws of nature</strong> that make suffering necessary for good outcomes. God could have created people who enjoy waking early, or fish that prefer afternoon, or removed sharp fishhooks entirely. So the laws of nature don\'t excuse suffering — they just push the responsibility back to whoever designed those laws. Miller\'s only remaining move is essentially Theodicy 6: perhaps God had incomprehensible reasons for creating those particular dependencies.',
      },
      {
        type: 'summary',
        title: 'Week 6 \u2014 Key Takeaways',
        points: [
          'The Problem of Evil targets the existence of an all-perfect god (omnipotent, omniscient, omnibenevolent).',
          'The argument uses Modus Tollens: If all-perfect god exists, no unjustified evils. There ARE unjustified evils. Therefore, no all-perfect god.',
          'Theists attack P2 by providing theodicies (justifications for why God allows evil).',
          'Six theodicies: appreciation, spiritual development, free will, supernatural beings, laws of nature, beyond understanding.',
          'The fawn example (natural evil with no observers) is the hardest case for theists to justify.',
        ],
        cta: 'Week 6 content is covered on the final exam, not the midterm.',
      },
    ],
  },
  {
    id: 'week8',
    title: 'Week 8',
    subtitle: 'Free Will and the Dilemma of Determinism',
    icon: '\u26D3',
    slides: [
      {
        type: 'intro',
        week: 'Week 8 — Free Will',
        question: 'Do we possess free will, or do determinism and randomness each undermine moral responsibility?',
        body: 'This lesson introduces the standard argument against free will, the concepts of determinism and indeterminism, and the major positions of compatibilism, incompatibilism, and libertarianism.',
      },
      {
        type: 'concept',
        title: 'Ordinary Thought and the Free Will Hypothesis',
        body: '<p>The reading opens with the mugging of a 101-year-old woman to highlight a commonsense idea: we normally hold people <strong>morally responsible</strong> for what they do, unlike animals or mere accidents.</p><p>That commonsense picture suggests that a responsible agent can <strong>step back</strong>, resist an impulse, and choose otherwise. But the text also adds an important qualification: people are only <strong>usually</strong> responsible, because excuses such as coercion, hypnosis, or deception can remove responsibility in special cases.</p>',
      },
      {
        type: 'concept',
        title: 'The Core Argument Against Free Will',
        body: '<p><strong>P1.</strong> Either determinism is true, or determinism is false.</p><p><strong>P2.</strong> If determinism is true, we do not have free will or moral responsibility.</p><p><strong>P3.</strong> If determinism is false, we do not have free will or moral responsibility.</p><p><strong>C.</strong> Therefore, we do not have free will or moral responsibility.</p><p>This argument is <strong>valid</strong>: if determinism is true, P2 gives the conclusion; if determinism is false, P3 gives the conclusion. So anyone who wants to keep free will must reject <strong>P2</strong>, <strong>P3</strong>, or both.</p>',
      },
      {
        type: 'check',
        q: 'Why does the reading say that people are usually responsible, rather than always responsible, for what they do?',
        a: 'Because ordinary moral practice already recognizes <strong>excuses</strong>. Someone who is <strong>forced, hypnotized, or tricked</strong> into acting badly is not responsible in the normal way. So the commonsense claim is not that every human action is blameworthy, but that responsibility is the <strong>usual default</strong> when those excuses are absent.',
      },
      {
        type: 'check',
        q: 'If you do NOT want to accept the conclusion of the argument against free will, which premise(s) should you target?',
        a: 'You should target <strong>P2 and/or P3</strong>. <strong>P1</strong> is just the law of excluded middle: either determinism is true or it is false. So the real debate is whether free will survives <strong>determinism</strong>, <strong>indeterminism</strong>, or neither.',
      },
      {
        type: 'term',
        label: 'Key Concept',
        term: 'Determinism',
        def: 'Roughly: what happens now is fixed by what happened in the past, together with the laws of nature. <strong>Given the same past, only one future is possible.</strong><br><br><strong>Important:</strong> determinism does <em>not</em> mean some external force drags you around against your will. It works <strong>through</strong> your own desires, motives, deliberation, and choices. The worry is that even those were themselves fixed by factors outside your control.',
      },
      {
        type: 'concept',
        title: 'Why Determinism Seems to Threaten Free Will',
        body: '<p>If determinism is true, then when the mugger attacks, there were <strong>no genuine alternative possibilities</strong>. Given the past and the laws of nature, he <em>could not have done otherwise</em>.</p><p><strong>Incompatibilists</strong> think this destroys free will, because they say alternative possibilities are necessary for moral responsibility. <strong>Compatibilists</strong> reject that assumption: they argue a person can still act freely even if the action was determined, so long as it flows from the person\'s own will rather than from coercion.</p>',
      },
      {
        type: 'concept',
        title: 'Why Introspection Does Not Settle the Issue',
        body: '<p>It may feel obvious, from the inside, that nothing determines your choice in advance. But the reading argues that this does <strong>not</strong> show your choice is undetermined.</p><p>At most, introspection shows that you are <strong>unaware</strong> of whatever determines your decision. Just as not seeing the cause of lightning does not prove there was no cause, not feeling a determining force does not prove that no determining factors were operating.</p>',
      },
      {
        type: 'check',
        q: 'What is the difference between compatibilists and incompatibilists in this lecture?',
        a: '<strong>Incompatibilists</strong> think <strong>P2 is true</strong>: if determinism is true, then free will and moral responsibility are impossible. <strong>Compatibilists</strong> think <strong>P2 is false</strong>: even in a deterministic world, we can still be free and morally responsible. The core disagreement is whether <strong>alternative possibilities</strong> are necessary.',
      },
      {
        type: 'concept',
        title: 'Frankfurt-Style Pressure on Alternative Possibilities',
        body: '<p>Compatibilists often try to show that <strong>alternative possibilities are not necessary</strong> for responsibility. The basic strategy is to describe a case where a person <strong>could not have done otherwise</strong>, yet still seems morally responsible because the action came from their own decision.</p><p>This is the motivation behind <strong>Frankfurt-style cases</strong>. Even if those cases are debated, they are meant to weaken the idea that "could have done otherwise" is required for blame or praise.</p>',
      },
      {
        type: 'check',
        q: 'What are Frankfurt-style cases trying to show?',
        a: 'They try to show that a person can be <strong>morally responsible even without alternative possibilities</strong>. If that works, then the incompatibilist move from determinism to "no free will" is blocked, because <strong>P2</strong> would be false.',
      },
      {
        type: 'concept',
        title: 'Why Indeterminism Also Looks Problematic',
        body: '<p>You might think indeterminism helps because it allows you to <strong>do otherwise</strong>. But the lecture and reading press a different worry: if your choice is not determined by your prior character, desires, values, and deliberation, then it can start to look <strong>random</strong>.</p><p>That is the pressure behind <strong>P3</strong>. If a decision just happens rather than being determined by you, it becomes unclear why you should be responsible for it. The problem is no longer "you could not have done otherwise" but rather "what explains this choice instead of the other one?"</p>',
      },
      {
        type: 'quote',
        label: 'The Reading\'s Worry About Indeterminism',
        text: '"as if a coin were flipped in the mugger\'s head."',
        source: '<em>Do We Possess Free Will?</em> — the thought is that a purely indeterministic choice looks like chance, not control.',
      },
      {
        type: 'check',
        q: 'Why might someone think P3 is true even though indeterminism gives us alternative possibilities?',
        a: 'Because <strong>alternative possibilities alone are not enough</strong>. If indeterminism means that, given exactly the same prior state, either choice could occur purely by chance, then it looks as if the outcome is <strong>random</strong> rather than <strong>under your control</strong>. That is why indeterminism can seem just as threatening as determinism.',
      },
      {
        type: 'bullets',
        title: 'The Dilemma of Determinism',
        items: [
          '<strong>If determinism is true:</strong> your action was fixed by prior factors outside your control, so incompatibilists say you are not free.',
          '<strong>If indeterminism is true:</strong> your action risks looking like a chance event, so critics say you are not in control either.',
          '<strong>Compatibilists:</strong> reject the first horn by denying that determinism rules out responsibility.',
          '<strong>Libertarians:</strong> reject the second horn by arguing that indeterminism can still leave room for genuine agency.',
          '<strong>Hard-line skeptics:</strong> accept both horns and conclude that free will or moral responsibility is an illusion.',
        ],
      },
      {
        type: 'check',
        q: 'Who are libertarians in this topic?',
        a: '<strong>Libertarians</strong> are <strong>incompatibilists</strong> who still believe we have free will and moral responsibility. So they deny that determinism is compatible with freedom, and they also deny <strong>P3</strong> by claiming we can be free even if determinism is false.',
      },
      {
        type: 'summary',
        title: 'Week 8 — Key Takeaways',
        points: [
          'Ordinary moral practice starts from the idea that people are usually responsible, while still allowing special excuses such as coercion, hypnosis, or trickery.',
          'The standard anti-free-will argument is valid: either determinism or indeterminism is true, and each seems to threaten responsibility.',
          'Determinism says the past plus the laws of nature fix a single future; it does not mean an outside force overrides your will.',
          'The feeling of conscious choice does not prove that choices are undetermined; it may show only ignorance of the determining factors.',
          'Incompatibilists say determinism removes alternative possibilities; compatibilists deny that alternative possibilities are necessary.',
          'Frankfurt-style cases try to show moral responsibility without the ability to do otherwise.',
          'Indeterminism gives alternative possibilities but may make choice look random, which is why P3 is tempting.',
        ],
        cta: 'Week 8 sets up the central final-exam debate over compatibilism, incompatibilism, libertarianism, and whether moral responsibility survives either horn of the dilemma.',
      },
    ],
  },
  {
    id: 'week9',
    title: 'Week 9',
    subtitle: 'AI Consciousness, Chinese Room, and Isomorphs',
    icon: '\uD83E\uDD16',
    slides: [
      {
        type: 'intro',
        week: 'Week 9 — AI Consciousness',
        question: 'Could an AI genuinely be conscious, or would intelligence and human-like behavior still fall short of inner experience?',
        body: 'This lesson introduces the Week 9 debate over whether AI can be conscious, what the Chinese Room does and does not prove, and why isomorph thought experiments do not settle the practical question about real-world AI.',
      },
      {
        type: 'term',
        label: 'Core Definition',
        term: 'Consciousness',
        def: 'Roughly, a being is conscious if there is <strong>something it is like to be that thing from the inside</strong>.<br><br>Consciousness involves <strong>inner experience</strong>: seeing, feeling, thinking, tasting, hearing, or having a point of view. The question is not merely whether a system behaves intelligently, but whether its information processing is accompanied by felt experience.',
      },
      {
        type: 'concept',
        title: 'The Hard Problem vs. the AI Question',
        body: '<p>Schneider distinguishes two issues. Chalmers\'s <strong>hard problem of consciousness</strong> asks why our own brain processing feels like something from the inside.</p><p>The <strong>Problem of AI Consciousness</strong> asks something different: whether a system built from a different substrate, such as silicon, is even <strong>capable</strong> of consciousness at all. The AI debate therefore starts one step earlier than the ordinary hard problem.</p>',
      },
      {
        type: 'bullets',
        title: 'Necessary and Sufficient Conditions in This Debate',
        items: [
          '<strong>To argue AIs can never be conscious:</strong> find a <strong>necessary condition</strong> for consciousness and show AI cannot satisfy it.',
          '<strong>To argue some AIs can be conscious:</strong> find a <strong>sufficient condition</strong> for consciousness and show at least some AI can satisfy it.',
          '<strong>Necessary</strong> means the thing must be present whenever consciousness is present.',
          '<strong>Sufficient</strong> means that if the condition is present, consciousness is guaranteed.',
          'The lecture uses this distinction to explain both biological-naturalist and techno-optimist strategies.',
        ],
      },
      {
        type: 'concept',
        title: 'The Anti-AI Strategy: Biological Naturalism',
        body: '<p>One anti-AI strategy says consciousness requires some special <strong>biological feature</strong> that ordinary computers lack. The lecture uses <strong>carbon-based biology</strong> as a candidate example.</p><p>The problem is that simply naming a biological feature does not show it is <strong>necessary</strong> for consciousness. The lecture and reading both stress that this move is too quick unless we can explain why only that sort of substrate can ever support experience.</p>',
      },
      {
        type: 'concept',
        title: 'The Chinese Room and Its Limit',
        body: '<p>Searle\'s Chinese Room imagines a system that gives the <strong>same outward responses</strong> as a Chinese speaker while the person inside merely manipulates symbols by rule, without understanding them.</p><p>If the room is not conscious, then the lesson is limited but important: matching a conscious being in <strong>input-output behavior</strong> is <strong>not sufficient</strong> for consciousness. That still falls short of proving that <em>no</em> AI could be conscious, because other kinds of internal organization may matter.</p>',
      },
      {
        type: 'check',
        q: 'What does the Chinese Room thought experiment show, assuming the room itself is not conscious?',
        a: 'It shows that being <strong>indistinguishable from a conscious being from the outside</strong> is <strong>not sufficient</strong> for being conscious. But that does <strong>not</strong> show that AI can never be conscious, because some other condition, involving the right sort of internal organization, might still be sufficient for consciousness.',
      },
      {
        type: 'term',
        label: 'Proposed Sufficient Condition',
        term: 'Functional Organization and Isomorphs',
        def: 'A common pro-AI idea is that consciousness depends on a system\'s <strong>functional organization</strong>: the abstract pattern of causal relations among internal parts and between those parts and external inputs and outputs.<br><br>An <strong>isomorph</strong> is a system with exactly the same relevant functional organization as a conscious system, even if it is built from a different material such as silicon.',
      },
      {
        type: 'concept',
        title: 'Chalmers\'s Brain-Replacement Thought Experiment',
        body: '<p>Imagine gradually replacing your neurons with microchips, each one preserving the same local function. Throughout the process, your overall functional organization remains the same.</p><p>Chalmers asks what happens to consciousness. The lecture presents three possibilities: the final isomorph is conscious; consciousness suddenly disappears at some point; or consciousness gradually fades. Chalmers argues the first option looks most plausible, because sudden blackout and unnoticed fading both seem bizarre if the system\'s organization stays fixed.</p>',
      },
      {
        type: 'quote',
        label: 'Schneider\'s Core Question',
        text: 'Would the processing of an AI feel a certain way, from the inside?',
        source: '<em>The Problem of AI Consciousness</em> — Schneider frames the issue as whether AI processing would have any felt quality at all.',
      },
      {
        type: 'bullets',
        title: 'Why Techno-Optimism Is Still Premature',
        items: [
          'Even if an isomorph would be conscious, that shows only <strong>conceptual possibility</strong>, not that humans can actually build one.',
          'Schneider distinguishes <strong>conceptual</strong>, <strong>nomological</strong> (law-of-nature), and <strong>technological</strong> possibility.',
          'Consciousness might depend on quantum-level features we cannot duplicate or even fully measure.',
          'Building a true isomorph may require a complete account of the brain plus enormous computational resources.',
          'Many real and near-term AIs are not brain isomorphs anyway, so the thought experiment may miss the systems we actually need to evaluate.',
        ],
      },
      {
        type: 'check',
        q: 'What is an isomorph in the Week 9 discussion?',
        a: 'An <strong>isomorph</strong> is a system that matches a conscious system in its <strong>relevant functional organization</strong> — the same causal pattern among internal parts and between those parts and inputs/outputs — even if it is made of a different material such as silicon.',
      },
      {
        type: 'check',
        q: 'Why does Schneider think techno-optimists move too quickly from "an isomorph might be conscious" to optimism about AI consciousness in general?',
        a: 'Because that inference jumps from a claim about <strong>special, carefully engineered brain isomorphs</strong> to a claim about the AIs we are actually likely to build. Schneider argues those are different questions. Even if an isomorph would be conscious, it may be <strong>too hard to build</strong>, may require unknown scientific advances, and tells us little about whether <strong>non-isomorphic</strong> AIs like near-term systems are conscious.',
      },
      {
        type: 'summary',
        title: 'Week 9 — Key Takeaways',
        points: [
          'Consciousness means there is something it is like to be a system from the inside; behavior alone does not settle that question.',
          'The Week 9 debate turns on necessary and sufficient conditions for consciousness.',
          'The Chinese Room, if sound, shows that human-like input-output behavior is not sufficient for consciousness.',
          'A stronger pro-AI proposal says that the same functional organization as a conscious brain may be sufficient, yielding the idea of an isomorph.',
          'Schneider argues that even if isomorph consciousness is conceptually possible, that does not show the AIs we actually build will be conscious.',
        ],
        cta: 'Week 9 prepares the move into simulation arguments by sharpening the difference between intelligence, behavior, consciousness, and what would count as evidence for each.',
      },
    ],
  },
  {
    id: 'week12',
    title: 'Week 12',
    subtitle: 'Art, Definitions, and Levinson',
    icon: '\uD83C\uDFA8',
    slides: [
      {
        type: 'intro',
        week: 'Week 12 — Art',
        question: 'What makes something a work of art?',
        body: 'This lesson connects definition logic with the philosophy of art. The central task is to find a necessary and sufficient condition for being art, then understand Levinson\'s historical definition of art.',
      },
      {
        type: 'term',
        label: 'Definition Logic',
        term: 'Necessary and Sufficient Conditions',
        def: '<strong>X is necessary and sufficient for Y</strong> means X is required for Y and X guarantees Y.<br><br>Equivalently: <strong>X if and only if Y</strong>. For art, a definition tries to identify an X such that all artworks have X and no non-artworks have X.',
      },
      {
        type: 'concept',
        title: 'Necessary and Sufficient Conditions for Art',
        body: '<p>A definition of art is not just a list of examples. It aims to state what all artworks have in common and what separates artworks from non-artworks.</p><p>If <strong>X</strong> is the definition of art, then every artwork must have X, and anything with X must be art. That is why counterexamples matter: one artwork without X shows X is not necessary; one non-artwork with X shows X is not sufficient.</p>',
      },
      {
        type: 'check',
        q: 'If X is a necessary and sufficient condition for art, what must be true?',
        a: '<strong>All artworks must have X, and all things with X must be artworks.</strong> In set terms, artworks and X line up exactly. If an artwork lacks X, X is not necessary. If a non-artwork has X, X is not sufficient.',
      },
      {
        type: 'concept',
        title: 'How "If and Only If" Changes Validity',
        body: '<p>The lecture reviews argument forms because definitions usually have an <strong>if and only if</strong> structure. With a plain conditional, "If A, then B," affirming B or denying A is invalid. But with "A if and only if B," both directions are built in.</p><p>So from <strong>A iff B</strong>, you may validly infer B from A, A from B, not-B from not-A, and not-A from not-B.</p>',
      },
      {
        type: 'concept',
        title: 'Beauty Is Not the Definition of Art',
        body: '<p>The lecture tests whether beauty could be the X that defines art. It fails both directions. Some artworks are not beautiful, so beauty is <strong>not necessary</strong> for art. And some beautiful things are not artworks, so beauty is <strong>not sufficient</strong> for art.</p><p>This is why examples such as <em>Fountain</em>, <em>The Comedian</em>, and <em>Artist\'s Shit</em> matter: they put pressure on purely exhibited or perceptible properties as definitions of art.</p>',
      },
      {
        type: 'check',
        q: 'Why is beauty not a successful definition of art?',
        a: 'Because it is <strong>neither necessary nor sufficient</strong>. Some artworks are not beautiful, so beauty is not required for art. Some beautiful things are not artworks, so beauty does not guarantee art.',
      },
      {
        type: 'term',
        label: 'Levinson\'s Main Idea',
        term: 'Historical Definition of Art',
        def: 'Levinson argues that what makes something art is not an exhibited property we can simply perceive. What matters is a historical and intentional relation: the object is intended to be regarded in ways that earlier artworks have been correctly regarded.',
      },
      {
        type: 'concept',
        title: 'Levinson: A Historical Definition of Art',
        body: '<p>Levinson\'s core claim is that an artwork is a thing <strong>intended for regard-as-a-work-of-art</strong>: regard in any way that prior artworks have been correctly or standardly regarded.</p><p>The definition is historical because later art depends on earlier art. Something counts as art at a time only if it is intentionally related to art that already existed before that time.</p>',
      },
      {
        type: 'check',
        q: 'According to Levinson, what makes something a work of art?',
        a: 'It is not beauty or another directly perceptible feature. It is that someone with the appropriate authority <strong>non-passingly intends</strong> the object to be regarded in ways that prior artworks have been correctly regarded.',
      },
      {
        type: 'bullets',
        title: 'Proprietary Right and Non-Passing Intention',
        items: [
          '<strong>Appropriate proprietary right:</strong> roughly, you cannot simply "artify" what you do not own or control.',
          '<strong>Creating the physical object is not enough:</strong> making something is neither necessary nor sufficient for having the relevant authority over it.',
          '<strong>Non-passing intention:</strong> the art-making intention must be reasonably stable, not a momentary thought.',
          '<strong>Correctly regarded:</strong> the definition uses correct or standard art-regards, not just any common use. Otherwise, if old portraits became commonly used as insulation, new insulation could wrongly count as art.',
        ],
      },
      {
        type: 'bullets',
        title: 'The Three Kinds of Art-Making Intention',
        items: [
          '<strong>Specific art-conscious intention:</strong> intending the object to be regarded in the specific way some particular past artworks or art kinds were correctly regarded.',
          '<strong>Non-specific art-conscious intention:</strong> intending it to be regarded in whatever ways past artworks have been correctly regarded, without a particular work in mind.',
          '<strong>Art-unconscious intention:</strong> intending it to be regarded in a specific way that is in fact a correct way of regarding past art, even though the maker does not know that.',
        ],
      },
      {
        type: 'check',
        q: 'Why does Levinson include art-unconscious intention?',
        a: 'To allow possible artworks made by people who know nothing about art history or art institutions. The Amazon stones and the farmer\'s wife examples are meant to show that someone can create art by intending an object to be appreciated in a relevant way, even without knowing that this is a way prior art has been regarded.',
      },
      {
        type: 'concept',
        title: 'Art Can Change Status Over Time',
        body: '<p>Levinson\'s definition is time-indexed: an object can be an artwork at one time and not another. An object may be physically created before it is art, then become art later when the right intention and historical relation are in place.</p><p>This is one reason the lecture stresses <strong>at t</strong>: whether something is art depends on the intentions and prior artworks available at that time.</p>',
      },
      {
        type: 'concept',
        title: 'Revolutionary Art',
        body: '<p>A major objection says Levinson cannot explain revolutionary art, because revolutionary art seems intended to be treated in a completely new way.</p><p>Levinson\'s response is that revolutionary artists can have a <strong>double intention</strong>: they initially direct audiences to try regarding the object in prior art ways, while expecting that this will frustrate the audience and push them toward a new mode of regard.</p>',
      },
      {
        type: 'check',
        q: 'How does Levinson respond to the objection about revolutionary art?',
        a: 'He says revolutionary art can involve a <strong>double intention</strong>. The artist may intend the object to be approached through past art-regards, but with the deeper aim that this approach will prove frustrating and lead viewers toward a new way of regarding it. The initial relation to past art is still needed to make it art.',
      },
      {
        type: 'summary',
        title: 'Week 12 — Key Takeaways',
        points: [
          'A definition of art aims at a necessary and sufficient condition: all artworks have X and no non-artworks have X.',
          'Beauty fails as a definition because it is neither necessary nor sufficient for art.',
          'Levinson defines art historically: art is intentionally related to earlier artworks and their correct modes of regard.',
          'The relevant intention must come from someone with appropriate proprietary right and must be non-passing.',
          'Levinson allows specific art-conscious, non-specific art-conscious, and art-unconscious intentions.',
          'The definition handles some revolutionary art by appeal to double intention.',
        ],
        cta: 'Week 12 links logic and aesthetics: exam questions can ask both whether an argument form is valid and whether a proposed definition survives counterexamples.',
      },
    ],
  },
  {
    id: 'week13',
    title: 'Week 13',
    subtitle: 'Death and Nagel\'s Deprivation Account',
    icon: '\u23F3',
    slides: [
      {
        type: 'intro',
        week: 'Week 13 — Death',
        question: 'Is death bad for the person who dies?',
        body: 'This lesson covers Nagel\'s answer: death is bad for the person who dies because it deprives them of goods they would otherwise have had. The lecture focuses on three challenges to that view.',
      },
      {
        type: 'term',
        label: 'Topic Definition',
        term: 'Death',
        def: 'Nagel and the lecture use <strong>death</strong> to mean the unequivocal and permanent end of our existence, with no conscious survival. This is different from the <strong>process of dying</strong>, during which the person still exists and may experience pain, fear, or other states.',
      },
      {
        type: 'concept',
        title: 'Nagel: The Deprivation Account',
        body: '<p>Nagel argues that death is bad for the person who dies because it <strong>deprives</strong> them of the goods they would otherwise have had. The badness is not a painful state of being dead. It is the loss of life and the loss of possible goods contained in continued life.</p><p>This also explains why mere organic survival is not the relevant good: an immediate coma followed by death twenty years later would not give you twenty extra years of valuable conscious life.</p>',
      },
      {
        type: 'check',
        q: 'On Nagel\'s view, why is death bad for the person who dies?',
        a: 'Death is bad because it <strong>deprives</strong> that person of the goods they would otherwise have had in continued life. It is bad as a loss, not because being dead is itself an unpleasant experience.',
      },
      {
        type: 'bullets',
        title: 'Three Challenges Nagel Answers',
        items: [
          '<strong>First challenge:</strong> can something be bad for you if it is only a deprivation and you do not mind it?',
          '<strong>Second challenge:</strong> who is the subject of the misfortune, and when is death bad for that subject?',
          '<strong>Third challenge:</strong> why is posthumous nonexistence bad if prenatal nonexistence is not?',
        ],
      },
      {
        type: 'concept',
        title: 'First Challenge: Can Deprivation Be Bad If You Do Not Mind It?',
        body: '<p>The first challenge says badness usually seems to involve something bad being present, such as pain, and the person minding it. Death has neither: there is no painful state of being dead, and the dead person does not mind anything.</p><p>Nagel replies with cases like severe mental degeneration. If an intelligent adult is reduced to the mental condition of a contented infant, the person may not mind the condition, but we still judge it bad for that person because of the life and possibilities lost.</p>',
      },
      {
        type: 'check',
        q: 'What is the point of Nagel\'s intelligent adult reduced to a contented infant example?',
        a: 'It shows that something can be bad for a person even if the person does not mind it and even if no painful state is present. The misfortune depends on the contrast between the person\'s actual condition and the possible adult life that was lost.',
      },
      {
        type: 'concept',
        title: 'Second Challenge: When Is Death Bad for You?',
        body: '<p>The second challenge argues: death is bad for you only if there is some particular time when it is bad for you; there is no such time; therefore death is not bad for you.</p><p>Nagel rejects the first premise. Some goods and evils do not need to be located at a precise time in the person\'s experience. The person who suffers the loss has a clear location, even if the loss itself is not easily located.</p>',
      },
      {
        type: 'check',
        q: 'Which premise should Nagel reject in the argument that death is bad only if there is a particular time when it is bad?',
        a: 'He should reject <strong>P1</strong>: the claim that death is bad for a person only if there is some particular time when it is bad for that person. Nagel thinks losses can be real misfortunes even when the misfortune itself is not temporally located in that simple way.',
      },
      {
        type: 'concept',
        title: 'The Subject of the Loss',
        body: '<p>Nagel does not say that nonexistence is bad for someone who never existed. If there is a loss, there must be someone who suffers it. This is why Beethoven\'s never-existing children are not unfortunate.</p><p>Death is different: the person who dies did exist, had a life, and could have continued to live. The loss belongs to that person, even though the person is no longer around to experience being deprived.</p>',
      },
      {
        type: 'concept',
        title: 'Third Challenge: Prenatal and Posthumous Nonexistence',
        body: '<p>Lucretius-style reasoning says: prenatal nonexistence is not bad for us; posthumous nonexistence is symmetrical with prenatal nonexistence; so death is not bad for us either.</p><p>Nagel rejects the symmetry. The time after death is time of which death deprives you, because you would have been alive then if you had not died. But the time before your birth is not usually time you could have lived: someone born substantially earlier would have been someone else.</p>',
      },
      {
        type: 'check',
        q: 'Why does Nagel reject Lucretius\'s symmetry between prenatal and posthumous nonexistence?',
        a: 'Because posthumous nonexistence deprives an already-existing person of possible continued life. Prenatal nonexistence usually does not deprive that same person of earlier life, because someone born substantially earlier would have been a different person.',
      },
      {
        type: 'concept',
        title: 'Death at an Old Age',
        body: '<p>Nagel acknowledges a harder question: is death bad even at 110, or only when it cuts life short unusually early? Keats dying at 24 seems more tragic than Tolstoy dying at 82, because Keats lost more possible years.</p><p>But Nagel suggests that from the inside, our future appears open-ended. If more valuable conscious life would still be good, then even normal or inevitable death may still be an abrupt cancellation of possible goods.</p>',
      },
      {
        type: 'check',
        q: 'Why might Nagel still think death is bad even when someone dies at an old age?',
        a: 'Because normality does not by itself show that more life would not be good. From the person\'s own perspective, the future can appear open-ended; if continued life would contain further goods, death still deprives the person of those possible goods.',
      },
      {
        type: 'summary',
        title: 'Week 13 — Key Takeaways',
        points: [
          'Nagel treats death as permanent nonexistence without conscious survival, not as the process of dying.',
          'Death is bad, if it is bad, because of deprivation: it removes the goods of continued life.',
          'A deprivation can be bad for someone even if they do not mind it, as shown by the mental degeneration example.',
          'Nagel denies that every misfortune must occur at a precise time in the person\'s experience.',
          'The subject of death\'s loss is the person who lived and could have continued living, not a never-existing person.',
          'Nagel rejects the symmetry between prenatal and posthumous nonexistence because only the latter deprives the person of possible continued life.',
          'Even old-age death may be bad if more valuable conscious life would still have been good.',
        ],
        cta: 'Week 13 is especially exam-friendly because it combines Nagel\'s substantive view with valid argument forms and premise-targeting.',
      },
    ],
  },
];

export const GEX1015_LESSONS: Lesson[] = RAW_GEX1015_LESSONS.map(interleaveLessonChecks);

export interface LessonSearchResult {
  lessonId: Lesson['id'];
  lessonIndex: number;
  lessonTitle: string;
  lessonSubtitle: string;
  slideIndex: number;
  slideType: LessonSlide['type'];
  slideLabel: string;
  snippet: string;
}

const stripHtml = (value: string): string => value.replace(/<[^>]+>/g, ' ');

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

export const getSlideLabel = (slide: LessonSlide): string => {
  switch (slide.type) {
    case 'intro':
      return slide.question;
    case 'concept':
    case 'bullets':
    case 'summary':
      return slide.title;
    case 'quote':
      return slide.label;
    case 'term':
      return slide.term;
    case 'check':
      return slide.q;
  }
};

const getSlideSearchText = (slide: LessonSlide): string => {
  switch (slide.type) {
    case 'intro':
      return normalizeWhitespace([slide.week, slide.question, slide.body].join(' '));
    case 'concept':
      return normalizeWhitespace([slide.title, stripHtml(slide.body)].join(' '));
    case 'bullets':
      return normalizeWhitespace([slide.title, ...slide.items.map(stripHtml)].join(' '));
    case 'quote':
      return normalizeWhitespace([slide.label, slide.text, stripHtml(slide.source)].join(' '));
    case 'term':
      return normalizeWhitespace([slide.label, slide.term, stripHtml(slide.def)].join(' '));
    case 'check':
      return normalizeWhitespace([slide.q, stripHtml(slide.a)].join(' '));
    case 'summary':
      return normalizeWhitespace([slide.title, ...slide.points, slide.cta].join(' '));
  }
};

const createSnippet = (searchText: string, queryTerms: string[]): string => {
  const lowerText = searchText.toLowerCase();
  const firstMatchTerm = queryTerms.find((term) => lowerText.includes(term)) ?? queryTerms[0] ?? '';
  const matchIndex = firstMatchTerm ? lowerText.indexOf(firstMatchTerm) : -1;

  if (matchIndex === -1) {
    return searchText.slice(0, 160).trim();
  }

  const start = Math.max(0, matchIndex - 55);
  const end = Math.min(searchText.length, matchIndex + Math.max(firstMatchTerm.length, 24) + 85);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < searchText.length ? '...' : '';

  return `${prefix}${searchText.slice(start, end).trim()}${suffix}`;
};

export const searchLessons = (query: string): LessonSearchResult[] => {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) {
    return [];
  }

  const queryTerms = trimmedQuery.split(/\s+/).filter(Boolean);
  const results: LessonSearchResult[] = [];

  GEX1015_LESSONS.forEach((lesson, lessonIndex) => {
    lesson.slides.forEach((slide, slideIndex) => {
      const searchText = getSlideSearchText(slide);
      const lowerText = searchText.toLowerCase();
      const isMatch = queryTerms.every((term) => lowerText.includes(term));

      if (!isMatch) {
        return;
      }

      results.push({
        lessonId: lesson.id,
        lessonIndex,
        lessonTitle: lesson.title,
        lessonSubtitle: lesson.subtitle,
        slideIndex,
        slideType: slide.type,
        slideLabel: getSlideLabel(slide),
        snippet: createSnippet(searchText, queryTerms),
      });
    });
  });

  return results;
};
