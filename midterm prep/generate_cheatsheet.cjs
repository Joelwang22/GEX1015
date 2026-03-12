const docx = require("C:/Users/joelw/AppData/Local/Temp/node_modules/docx");
const fs = require("fs");

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, PageOrientation,
  ShadingType, TableLayoutType, convertInchesToTwip
} = docx;

const FONT = "Arial";
const SZ = 16; // 8pt in half-points
const SZH = 17; // 8.5pt for headings
const SZS = 15; // 7.5pt for tables
const SP = { before: 0, after: 0, line: 228 }; // slightly more breathable line spacing
const SPH = { before: 55, after: 0, line: 228 }; // more space before headings for visual separation

// Border style for tables
const B = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const BORDERS = { top: B, bottom: B, left: B, right: B };
const NOBORDERS = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
};

function t(text, bold = false, italic = false, sz = SZ, color) {
  const opts = { text, size: sz, font: FONT, bold, italic };
  if (color) opts.color = color;
  return new TextRun(opts);
}

function h(text, fill = "2E4057") {
  return new Paragraph({
    spacing: SPH,
    shading: { type: ShadingType.CLEAR, fill },
    children: [t(text, true, false, SZH, "FFFFFF")],
  });
}

function p(runs, spacing = SP) {
  return new Paragraph({ spacing, children: runs });
}

function tbl(headers, rows, widths) {
  const hdr = new TableRow({
    children: headers.map((h, i) =>
      new TableCell({
        borders: BORDERS,
        shading: { type: ShadingType.CLEAR, fill: "D6E4F0" },
        width: widths ? { size: widths[i], type: WidthType.DXA } : undefined,
        children: [new Paragraph({ spacing: { before: 0, after: 0, line: 200 }, children: [t(h, true, false, SZS)] })],
      })
    ),
  });
  const body = rows.map(row =>
    new TableRow({
      children: row.map((c, i) => {
        const runs = typeof c === 'string' ? [t(c, false, false, SZS)] : c;
        return new TableCell({
          borders: BORDERS,
          width: widths ? { size: widths[i], type: WidthType.DXA } : undefined,
          children: [new Paragraph({ spacing: { before: 0, after: 0, line: 200 }, children: runs })],
        });
      })
    })
  );
  return new Table({ layout: TableLayoutType.FIXED, rows: [hdr, ...body], width: { size: 100, type: WidthType.PERCENTAGE } });
}

// ============ PAGE 1 ============
const pg1 = [
  h("WEEK 2: GOODNESS — What is non-instrumentally good?"),
  p([
    t("Instrumentally good", true), t(" = good as means to an end (money, vaccines). "),
    t("Non-instrumentally good", true), t(" = good for its own sake (pleasure). Can be both (pleasure from exercise). Chain: A grade→GPA→job→money→things→pleasure."),
  ]),

  h("1. HEDONISM (Bentham, Mill) — from Greek 'hédoné' = pleasure", "3B6B8A"),
  p([t("Only pleasure is non-instrumentally good; only pain is non-instrumentally bad.", true), t(" All other goods (friendship, knowledge) are instrumentally good BECAUSE they lead to pleasure.")]),
  p([
    t("Pleasure = any mental state that feels good: bodily sensations, positive emotions (joy, pride), 'higher' pleasures (artistic, intellectual). Pain = feels bad: bodily sensations, negative emotions (fear, shame), depression."),
  ]),
  p([
    t("Attractions: ", true), t("(1) Hard to deny pleasure is non-instrumentally good. (2) Hard to find anything else that clearly is. (3) Many different good lives (sources of pleasure vary)."),
  ]),
  p([
    t("Obj 1 — False Beliefs: ", true), t("Friends secretly hate you vs genuinely like you — same pleasure but intuitively not equally well off."),
  ]),

  h("Nozick's Experience Machine", "5A7D9A"),
  p([
    t("Machine gives ANY experience desired. Float in tank with electrodes; won't know you're inside. Would you plug in for life? ", true),
    t("Clarifications: won't malfunction; pre-programmed in 2-year cycles (pick experiences, float in tank, repeat); others can plug in too (so no need to stay unplugged to serve them); key = you get ONLY THE EXPERIENCE of whatever life you want."),
  ]),
  p([
    t("Nozick's 3 reasons NOT to plug in: ", true),
    t("(1) Want to DO things, not just experience doing them. (2) Want to BE a certain person (tank = 'indeterminate blob'; 'plugging in is a kind of suicide'). (3) Want contact with REALITY, not man-made world."),
  ]),
  p([
    t("Nozick's conclusion: ", true), t("Pleasure is NOT the only non-instrumentally valuable thing. "),
    t("\"We learn that something matters to us in addition to experience by imagining an experience machine and then realizing that we would not use it.\"", false, true),
  ]),
  p([
    t("Hedonist responses: ", true), t("Intuitions influenced by irrelevant factors: fear of finding out truth, guilt about leaving others, status quo bias. Reversal: if ALREADY in machine, many might choose to stay."),
  ]),
  p([
    t("Transformation Machine: ", true), t("transforms you into ANY person you'd like to be. Still wouldn't use it → something matters beyond experiences AND what you're like. "),
    t("Result Machine: ", true), t("produces any result in world you would produce. Still not enough → we want to LIVE (active verb) ourselves, in contact w/ reality. \"What is most disturbing about [machines] is their living of our lives for us.\""),
  ]),

  h("2. DESIRE THEORY", "3B6B8A"),
  p([
    t("Only desire fulfillment is non-instrumentally good; only desire frustration is non-instrumentally bad.", true),
    t(" Can disagree w/ Hedonism: some may not desire pleasure; may not get pleasure from fulfilled desire (e.g. don't know it's fulfilled)."),
  ]),
  p([
    t("Attractions: ", true), t("(1) Explains why not plug in (desires not ACTUALLY fulfilled, just think they are). (2) Even more diverse good lives than hedonism."),
  ]),
  p([
    t("Objections: ", true), t("Is fulfillment always good? Oppressed slave wanting to serve master; youth w/ death wish; alcoholic wanting only to drink; mathematician counting grass. Problem: desires the WRONG thing — can't explain wrongness without desire-independent goods."),
  ]),
  p([
    t("KEY: ", true), t("On Desire Theory, person may NOT KNOW how valuable their life is", true), t(" (e.g. mother doesn't know if missing child is safe = doesn't know if desire fulfilled)."),
  ]),

  h("3. OBJECTIVE LIST THEORIES", "3B6B8A"),
  p([
    t("Things OBJECTIVELY non-instrumentally good whether desired or not.", true),
    t(" Items: knowledge, autonomy, friendship, achievement, pleasure. Usually >1 item on list."),
  ]),
  p([
    t("Attractions: ", true), t("(1) Explains Experience Machine. (2) Explains why some desire fulfillment isn't good."),
  ]),
  p([
    t("Objections: ", true), t("(1) Elitist — claims things good for people even if they don't want them. (2) What do items have in common? If something, isn't THAT the real good?"),
  ]),

  h("COMPARISON TABLE", "5A7D9A"),
  tbl(
    ["", "Hedonism", "Desire Theory", "Obj. List"],
    [
      ["Exp. Machine?", "Plug in (always)", [t("Varies by person", true), t(" — if only desire pleasure, plug in; if desire friendship/achievement, don't")], "Don't (miss obj. goods)"],
      ["Non-instr. good?", "Only pleasure", "Only desire fulfillment", "Multiple obj. goods"],
      ["Know life's value?", "Yes", "Not necessarily", "Not necessarily"],
      ["Weakness?", "False belief cases", "Wrong desires", "Elitism; unity?"],
    ],
    [1300, 1600, 2200, 2200]
  ),

  // WEEK 3
  h("WEEK 3: RIGHT & WRONG 1 — Consequentialism & Singer"),
  h("Moral Terminology", "5A7D9A"),
  p([
    t("Consequentialism: ", true), t("right/wrong depends ONLY on consequences (intention, motive irrelevant). Utilitarianism = one TYPE of consequentialism. Could have other forms (e.g. 'cat maximization' — right = max cats)."),
  ]),
  p([
    t("Wrong (impermissible)", true), t(" vs "), t("Right (permissible)", true),
    t(" = {"), t("Required (obligatory)", true), t(" = wrong not to do | "),
    t("Supererogatory", true), t(" = good but not required | "),
    t("Neutral", true), t(" = neither}"),
  ]),

  h("CLASSIC UTILITARIANISM (Bentham, Mill)", "3B6B8A"),
  p([
    t("Right action = MAXIMIZES total net pleasure", true),
    t(" (total pleasure − total pain to EVERYONE affected). Only maximum = right; all else = wrong. "),
    t("Edge case: if multiple actions produce SAME maximum → ALL permissible (none required, none wrong).", false, true),
  ]),
  p([t("(1) Impartial: ", true), t("Anyone's pleasure equal regardless of class/gender/race/nationality/SPECIES (if same amount & quality).")]),
  p([t("(2) Demanding: ", true), t("Only max action is right → permissible ≈ required; no supererogatory.")]),
  p([t("(3) Context-sensitive: ", true), t("No action TYPE always right/wrong (even torture if maximizes, e.g. bomb).")]),
  p([t("(4) Permits/requires sacrificing innocents", true), t(" if maximizes net pleasure.")]),
  p([
    t("'Greatest happiness for greatest number' INACCURATE: ", true, true),
    t("(a) Pain matters too. (b) Action benefiting most people ≠ max total (e.g. 50 to 1 person > 1 to 10 people = 41 > 10). ", false, true),
    t("Net positive pleasure ≠ right: ", true, true),
    t("Only action that MAXIMIZES is right. E.g. A1 (5P−1p=4), A2 (4P−1p=3), A3 (1P−2p=−1): only A1 right even though A2 also net positive.", false, true),
  ]),
  p([
    t("EXAM: ", true, true),
    t("Can't determine if action is right without knowing ALL other available actions. E.g. 10 pleasure & 10 pain = 0 net → need to know alternatives.", false, true),
  ]),

  h("SINGER — Famine, Affluence, & Morality (1972)", "3B6B8A"),
  p([
    t("Claim: We OUGHT to donate significantly to help extreme poverty. OBLIGATORY, not supererogatory. Morally WRONG not to.", true),
    t(" Singer is utilitarian but argument doesn't rely on utilitarianism."),
  ]),
  p([
    t("Simple argument: ", true),
    t("P1. We ought to save drowning child. P2. No morally relevant difference between that & helping people in extreme poverty. C. We ought to help. "),
    t("(Valid — Modus Ponens form.)", false, true),
  ]),
  p([
    t("Strong principle: ", true),
    t("\"If in our power to prevent something bad, w/o sacrificing anything of COMPARABLE MORAL IMPORTANCE, we ought to.\""),
  ]),
  p([
    t("Moderate: ", true),
    t("\"...prevent something VERY BAD...w/o sacrificing anything MORALLY SIGNIFICANT.\""),
  ]),
  p([
    t("Key diff: ", true, true),
    t("'comparable moral importance' vs 'morally significant'; 'bad' vs 'very bad'. Singer prefers strong version.", false, true),
  ]),
  p([
    t("Complex arg: ", true),
    t("P1. If can prevent bad w/o sacrificing comparable moral importance → ought to. P2. Poverty suffering is bad. P3. Can prevent w/o comparable sacrifice. C. Ought to prevent."),
  ]),
  p([
    t("Diff 1 — Distance: ", true), t("NOT morally relevant (only psychologically). Can help effectively far away today. "),
    t("Diff 2 — Others could help: ", true), t("Doesn't reduce YOUR obligation. Would you ignore drowning child bc others also standing around? "),
    t("Per reading p.233: even if everyone similarly placed donated, still wrong not to.", false, true),
  ]),
  p([
    t("Strong ver: ", true), t("donate until sacrificing comparable MORAL importance. "),
    t("Moderate: ", true), t("until sacrificing something of moral importance. Even moderate = very demanding (buying unnecessary clothes is wrong)."),
  ]),
  p([
    t("Clarification: ", true), t("Singer only concerns REDUCING SUFFERING, not maximizing happiness. Can allow supererogatory actions to exist. Claim: helping poverty is NOT supererogatory but required."),
  ]),
  p([
    t("Even moderate ver: ", true, true), t("buying ANYTHING unnecessary (clothes, shoes for appearance) is morally WRONG if money could prevent suffering.", false, true),
  ]),
  p([
    t("Denying Singer: ", true, true), t("Rejecting 'distance irrelevant' = rejecting P2 of simple argument (morally relevant difference EXISTS) = argument UNSOUND (not invalid — form is still Modus Ponens). Rejecting P1 = claiming no obligation to save drowning child.", false, true),
  ]),
  p([
    t("Duty vs charity collapse: ", true), t("Traditional distinction can't be drawn where we normally draw it. Famine donations treated as 'charity'/'generosity' but Singer: it's OBLIGATORY — just like saving drowning child."),
  ]),
  p([
    t("'If everyone gave £5, enough' objection: ", true), t("Hypothetical premise but non-hypothetical conclusion. Since NOT everyone IS giving, your obligation isn't capped at £5. "),
    t("Marginal utility: ", true), t("Strong ver → give until point of marginal utility (near Bengali refugee circumstances)."),
  ]),
  p([
    t("Sidgwick-Urmson obj: ", true), t("Demanding standards → ppl won't comply at all. Singer: (a) standards shape what ppl think possible, (b) about what we REQUIRE of others, not what we OUGHT to do. "),
    t("Population: ", true), t("'relieving famine postpones starvation' — doesn't remove obligation; best long-run prevention = support population control."),
  ]),
  p([
    t("Govt responsibility obj: ", true), t("'Aid should be govt's job, not individuals.' Singer: no evidence private giving reduces govt action; opposite more plausible. Unless definite probability refusal triggers govt action, must give privately."),
  ]),
  p([
    t("Other objections: ", true), t("'Earned right to enjoy' — Herbert Simon: social capital = 90% of wealth in rich societies; 'treating symptoms' — effective aid exists; Singer not arguing for coercion/taxation. Aquinas: \"whatever a man has in superabundance is owed, of natural right, to the poor.\""),
  ]),
  p([
    t("Historical context: ", true), t("East Bengal 1971 — 9 million refugees from poverty, cyclone & civil war. Britain gave £14.75M to Bengal but spent £275M+ on Concorde. Australia's aid < 1/12 cost of Sydney Opera House."),
  ]),
];

// ============ PAGE 2 ============
const pg2 = [
  h("WEEK 4: RIGHT & WRONG 2 — Non-Consequentialism & Trolley Cases"),
  p([
    t("Non-consequentialism: ", true), t("NOT the case that right/wrong depends ONLY on consequences. Some think consequences irrelevant; others think one of several factors."),
  ]),

  h("KEY CASES", "5A7D9A"),
  p([
    t("Judge (Foot): ", true), t("Rioters will kill 5 hostages unless judge frames 1 innocent person. Most: judge must NOT frame → parallels Bridge. "),
    t("Transplant (Thomson): ", true), t("Surgeon can save 5 patients by cutting up 1 healthy bystander for organs. \"Strikingly abhorrent\" — like Bridge."),
  ]),

  h("TROLLEY CASES", "5A7D9A"),
  tbl(
    ["Case", "Opt 1 (5 die)", "Opt 2 (1 dies)", "Common Intuition"],
    [
      ["Driver", "Continue, kill 5", "Steer side-track, kill 1", [t("PERMISSIBLE", true)]],
      ["Bystander", "Do nothing, 5 die", "Throw switch, 1 dies", [t("PERMISSIBLE", true)]],
      ["Bridge", "Do nothing, 5 die", "Push person off bridge", [t("IMPERMISSIBLE", true)]],
      ["Loop", "Do nothing, 5 die", "Throw switch; person stops trolley & dies", [t("PERMISSIBLE", true), t(" (many think)")]],
    ],
    [900, 1800, 2600, 2000]
  ),
  p([
    t("Utilitarians: ", true), t("Opt 2 right in ALL cases (fewer deaths = more net pleasure). No morally relevant difference. Common intuitions unreliable. "),
    t("Non-consequentialist challenge: ", true), t("explain WHY intuitions differ — principled reason why Opt 2 OK in Driver/Bystander but not Bridge."),
  ]),

  h("Approach 1: KANT — Don't treat persons MERELY as a means", "3B6B8A"),
  p([
    t("Wrong to treat persons MERELY as means", true), t(" (NOT always wrong to treat as means — key word 'merely'). Consent is relevant factor."),
  ]),
  p([
    t("Test: ", true), t("Person's involvement part of route plan succeeds = can't achieve goal if person disappears before you act → treating as means. "),
    t("EXAM: ", true, true), t("You are NOT expected to know what distinguishes 'merely as a means' from 'as a means'. Just know: treating as a means is NOT always wrong — key word is 'merely'.", false, true),
  ]),
  tbl(
    ["Case", "As means?", "Kant's verdict"],
    [
      ["Driver", "NO (don't need person)", "Unclear"],
      ["Bystander", "NO (save 5 even if person gone)", "Unclear"],
      ["Bridge", [t("YES", true), t(" (need body to stop trolley)")], [t("WRONG", true)]],
      ["Loop", [t("YES", true), t(" (need person to stop trolley)")], [t("WRONG", true), t(" — challenge! Many think permissible")]],
    ],
    [1000, 3200, 3200]
  ),
  p([
    t("EXAM: ", true, true), t("Not needing person ≠ not killing them. In Bystander you DON'T need person (not treating as means) but you ARE killing them (Thomson).", false, true),
  ]),

  h("Approach 2: FOOT — Killing worse than letting die", "3B6B8A"),
  p([
    t("Philippa Foot: Killing morally worse than letting die.", true),
    t(" Positive duties (aid) vs Negative duties (non-interference) — negative duties are WEIGHTIER."),
  ]),
  p([
    t("Doctrine of Double Effect: ", true), t("Foot assessed whether it explains trolley intuitions; concluded it doesn't → proposed killing vs letting die instead."),
  ]),
  p([
    t("Named principles — ", true),
    t("'Letting 5 Die vs Killing 1': A must let 5 die if saving requires killing B. 'Killing 5 vs Killing 1': A must not kill 5 if can kill 1 instead."),
  ]),
  tbl(
    ["Case", "Opt 1", "Opt 2", "Analysis"],
    [
      ["Driver", "Kill 5", "Kill 1", "Kill fewer → Opt 2 OK"],
      ["Bridge", "Let 5 die", "Kill 1", "Letting die < killing → Opt 1"],
      ["Bystander", "Let 5 die", "Kill 1", [t("PROBLEM:", true), t(" Same as Bridge but intuition differs!")]],
    ],
    [1000, 1400, 1400, 3600]
  ),

  h("THOMSON — Turning the Trolley (2008)", "3B6B8A"),
  p([
    t("Agrees w/ Foot. Resolves problem: Opt 2 IS WRONG in Bystander too.", true),
    t(" (Driver: Opt 2 permissible. Bystander & Bridge: Opt 2 impermissible.)"),
  ]),
  p([
    t("Bystander's Three Options: ", true),
    t("(i) do nothing (5 die), (ii) turn trolley onto 1 person, (iii) turn trolley onto yourself."),
  ]),
  p([
    t("\"If he can throw the switch onto himself, how dare he throw it onto the workman?\"", false, true),
    t(" Analogy: stealing to donate to Oxfam instead of using own money — worse bc cost is LIFE not money."),
  ]),
  p([
    t("Argument: ", true),
    t("P1. Wrong to turn trolley onto another in Three Options. P2. If wrong in Three Options → wrong in Two Options. C. Wrong in Bystander."),
  ]),
  p([
    t("\"Since he wouldn't himself pay the cost if he could, he can't decently make someone else pay it.\"", false, true),
    t(" Even if altruistic: can't assume workman equally altruistic & would consent."),
  ]),
  p([
    t("Thomson's principles — ", true),
    t("Third: A must not kill B to save 5 if A can kill himself instead. Fourth: A may let 5 die if only permissible means = killing himself."),
  ]),
  p([
    t("Key Driver distinction: ", true), t("Driver doing nothing KILLS 5 (not morally optional — violates negative duty) → must act & pay cost."),
  ]),
  p([
    t("Bystander doing nothing merely LETS 5 die (morally optional). So bystander MAY do nothing. ", true),
    t("Morality does NOT require bystander to sacrifice himself (option iii).", true, true),
  ]),
  p([
    t("Thomson on excessive altruism: ", true), t("\"Willingness to give up one's life simply on learning 5 others will live if and only if one dies is a sign of serious moral defect.\" Self-sacrifice intelligible only w/ special reasons (my children, friends, commitment)."),
  ]),
  p([
    t("Thomson on Loop: ", true), t("Would say WRONG (even stronger than Bystander — you're killing AND using person as means). Thomson & Foot AGREE on Loop (both say wrong to throw switch)."),
  ]),
  p([
    t("Why people think Bystander OK? ", true), t("(a) More will live (utilitarian pull). (b) Means (switch) less drastic than Bridge (pushing). But mildness of means does NOT make infringement count less."),
  ]),
  p([
    t("Thomson & utilitarians AGREE: ", true), t("common intuition about Bystander WRONG. Opposite reasons — utilitarians: Opt 2 permissible in BOTH; Thomson: wrong in BOTH."),
  ]),

  h("WEEK 5: LOGICAL REASONING — Arguments"),
  p([
    t("Argument = premises + conclusion. ", true),
    t("Deductive: premises supposed to GUARANTEE conclusion's truth. Non-deductive (inductive): premises make conclusion LIKELY but don't guarantee it (e.g. 'sun has risen every day → will rise tomorrow')."),
  ]),
  p([
    t("Valid: ", true), t("IF all premises true, conclusion MUST be true. "),
    t("Test: assume all premises true, ask: CAN conclusion be false? Yes→INVALID. No→VALID. ", true, true),
    t("Validity ≠ premises actually true.", true, true),
  ]),
  p([
    t("\"If A, then B\" ≈ \"All As are Bs\". ", true), t("'If A then B' is false ONLY if A can be true while B false."),
  ]),
  p([
    t("Sound = valid + all premises actually true. If sound → conclusion MUST be true.", true),
    t(" A = antecedent, B = consequent in \"If A then B\".", false, true),
  ]),

  h("FOUR ARGUMENT FORMS", "C0392B"),
  tbl(
    ["Form", "Structure", "Valid?"],
    [
      ["(1) Modus Ponens (affirm antecedent)", "If A→B; A; ∴ B", [t("ALWAYS VALID", true, false, SZS, "008000")]],
      ["(2) Modus Tollens (deny consequent)", "If A→B; Not B; ∴ Not A", [t("ALWAYS VALID", true, false, SZS, "008000")]],
      ["(3) Deny Antecedent", "If A→B; Not A; ∴ Not B", [t("ALWAYS INVALID", true, false, SZS, "CC0000")]],
      ["(4) Affirm Consequent", "If A→B; B; ∴ A", [t("ALWAYS INVALID", true, false, SZS, "CC0000")]],
    ],
    [2200, 2800, 2400]
  ),
  p([
    t("EXAM SKILL — Fill in missing premise: ", true, true),
    t("Given P1 'A' and C 'B', need 'If A→B' for Modus Ponens. Given 'If A→B' and C 'Not A', check: 'Not B' = Modus Tollens (valid) but 'B' = Affirm Consequent (invalid). Match the FORM.", false, true),
  ]),
  p([
    t("EXAM TRAPS: ", true, true),
    t("(1) Valid w/ all false premises & false conclusion = possible. ", false, true),
    t("(2) Valid + false premise + TRUE conclusion = still UNSOUND (e.g. 'All philosophers are men; Jungkook is a philosopher; ∴ Jungkook is a man' — valid form, false P1, true C, but unsound).", false, true),
  ]),
  p([
    t("(3) All true premises + true conclusion ≠ sound (could be invalid). ", false, true),
    t("(4) Invalid ≠ conclusion false — just THIS argument fails.", false, true),
  ]),
  p([
    t("(4) Required ⊂ Permissible. ", true, true), t("'If permissible then required' = FALSE. 'If required then permissible' = TRUE.", false, true),
  ]),
  p([
    t("(5) Death penalty trap: ", true, true), t("'If DP deters crime→justified; DP doesn't deter; ∴ not justified' = INVALID (denying antecedent).", false, true),
  ]),

  h("WEEK 5: CULTURAL RELATIVISM (Rachels)"),
  p([t("Cultural Relativism (CR) — 6 claims: ", true), t("These are INDEPENDENT — some may be true even if others false.", false, true)]),
  p([t("(1) Diff societies have diff moral codes. (2) No objective standard to judge one better. (3) Our code has no special status.")]),
  p([t("(4) No universal truth in ethics. (5) Society's moral code determines right/wrong within it. (6) Arrogant to judge others; should be tolerant.")]),
  p([
    t("Moral code", true), t(" = roughly, the moral rules members of society follow & believe true. W.G. Sumner: \"The 'right' way is the way the ancestors used...the tradition is its own warrant...whatever is, is right.\""),
  ]),
  p([
    t("Herodotus/Darius story: ", true), t("King Darius summoned Greeks (who cremated dead) & Callatians (who ate dead). Each horrified by other's practice. Eating dead = sign of respect; burning = scornful. Herodotus: \"Everyone without exception believes his own native customs...to be the best.\""),
  ]),
  p([
    t("Argument FOR CR is INVALID: ", true),
    t("P1. Different cultures have different moral codes. C. CR is true. "),
    t("Premise = what people BELIEVE; conclusion = what IS. ", false, true),
    t("Analogy: people disagree about earth's shape → doesn't mean no truth in geography."),
  ]),
  p([
    t("Showing argument invalid ≠ CR is false.", true, true), t(" Rachels goes further w/ 3 arguments AGAINST CR (all Modus Tollens):"),
  ]),
  p([
    t("Structure: ", true), t("P1. If CR true → [bad consequence]. P2. Not [bad consequence]. C. CR false."),
  ]),
  p([
    t("1. ", true), t("Can't say other societies' customs morally inferior (slavery, anti-Semitism). "),
    t("2. ", true), t("Right/wrong = just consult own society's standards (can't criticize own code, e.g. apartheid). "),
    t("3. ", true), t("Moral progress impossible (women's rights = just 'change' not 'improvement')."),
  ]),
  p([
    t("Bonus: ", true), t("CR may imply tolerance NOT required (if culture says be intolerant, that's 'right' for them)."),
  ]),
  p([
    t("CR responses: ", true), t("(1) 'Bite the bullet' (= accept counterintuitive implication rather than abandon view). (2) Attack premises. (3) Distinguish practices vs ideals — but limited (reformer can't challenge ideals themselves). "),
    t("Nazi Germany counter: ", true, true), t("if Nazism WAS their ideal, CR can't condemn it even with practices/ideals distinction.", false, true),
  ]),
  p([t("Less disagreement than appears: ", true), t("Many differences stem from factual/religious beliefs, not values (e.g. cow = Grandma).")]),
  p([t("Eskimo example: ", true), t("infanticide = last resort in harsh environment. Mothers nursed 4+ yrs limiting capacity; nomadic = carry only 1 baby; female babies killed more bc males = hunters w/ high casualty rate; adoption common. Also: old people left in snow when too feeble; wife-sharing w/ guests = hospitality. NOT less caring — same underlying value (protect family), different circumstances.")]),
  p([
    t("Universal values (Rachels): ", true), t("Truth-telling (w/o it, communication impossible → complex societies can't exist), prohibition on murder (w/o it, no one feels secure → society collapses), care for young — necessary for ANY society to exist."),
  ]),
  p([
    t("2 positive lessons from CR: ", true),
    t("(1) Many practices ARE mere social conventions (funerary customs, dress codes, breast covering) — CR right about this but WRONG to extend to ALL practices. (2) Keep open mind — our feelings may be mere cultural conditioning (e.g. views on homosexuality may be 'mere prejudice'). "),
    t("MLK under CR: ", true), t("reformer can push society toward its OWN ideals but can't challenge ideals themselves — 'ideals are by definition correct' under CR."),
  ]),

  h("CR EXAM TRAPS (from past paper)", "C0392B"),
  p([
    t("(1) CR does NOT say every culture ought to be tolerant (no universal truths!). ", true),
    t("(2) Person CAN do wrong within own culture (violate own culture's code). ", true),
  ]),
  p([
    t("(3) CR does NOT say no obligations to other cultures' members (own code may require it). ", true),
    t("(4) Invalid argument's conclusion can still be true — just not proven by THAT argument.", true),
  ]),

  h("QUICK REFERENCE — TROLLEY VERDICTS BY PHILOSOPHER", "C0392B"),
  tbl(
    ["Case", "Utilitarian", "Kant", "Foot", "Thomson"],
    [
      ["Driver", [t("Opt 2 ✓", true, false, SZS, "008000")], "Unclear", "Opt 2 OK (kill fewer)", [t("Opt 2 ✓", true, false, SZS, "008000"), t(" (must act)")]],
      ["Bystander", [t("Opt 2 ✓", true, false, SZS, "008000")], "Unclear", [t("PROBLEM", true, false, SZS, "CC0000")], [t("Opt 2 ✗", true, false, SZS, "CC0000"), t(" (lets die)")]],
      ["Bridge", [t("Opt 2 ✓", true, false, SZS, "008000")], [t("Opt 2 ✗", true, false, SZS, "CC0000")], "Opt 1 (letting die < killing)", [t("Opt 2 ✗", true, false, SZS, "CC0000")]],
      ["Loop", [t("Opt 2 ✓", true, false, SZS, "008000")], [t("Opt 2 ✗", true, false, SZS, "CC0000")], [t("Opt 2 ✗", true, false, SZS, "CC0000")], [t("Opt 2 ✗", true, false, SZS, "CC0000")]],
    ],
    [1000, 1200, 1200, 2200, 1800]
  ),
];

// ============ BUILD DOCUMENT ============
const sectionProps = {
  page: {
    size: {
      orientation: PageOrientation.LANDSCAPE,
      width: convertInchesToTwip(11.69),
      height: convertInchesToTwip(8.27),
    },
    margin: {
      top: convertInchesToTwip(0.28),
      bottom: convertInchesToTwip(0.28),
      left: convertInchesToTwip(0.28),
      right: convertInchesToTwip(0.28),
    },
  },
  column: {
    space: convertInchesToTwip(0.15),
    count: 4,
  },
};

const doc = new Document({
  sections: [
    { properties: sectionProps, children: pg1 },
    { properties: { ...sectionProps }, children: pg2 },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = "C:/Users/joelw/Documents/Quizzer/content/GEX1015/midterm prep/GEX1015_midterm_cheatsheet.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Cheatsheet saved to:", outPath);
});
