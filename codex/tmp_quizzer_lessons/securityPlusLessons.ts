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

const STORAGE_KEY = 'security_plus_lessons_done';

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

export const SECURITY_PLUS_LESSONS: Lesson[] = [
  {
    id: 'threats-and-controls',
    title: 'Lesson 1',
    subtitle: 'Threats, Social Engineering, and Core Controls',
    icon: 'TA',
    slides: [
      {
        type: 'intro',
        week: 'Lesson 1 - Threats and Controls',
        question: 'What is being attacked, and which control best reduces the risk?',
        body: 'This lesson covers common Security+ threat patterns, the CIA triad, social engineering, and the difference between detective and preventive controls.',
      },
      {
        type: 'term',
        label: 'Core Model',
        term: 'CIA Triad',
        def: '<strong>Confidentiality</strong> keeps data from unauthorized disclosure. <strong>Integrity</strong> protects against unauthorized change. <strong>Availability</strong> keeps systems and data usable when needed.<br><br>Security+ questions often describe a breach and ask which element of the triad is most directly impacted.',
      },
      {
        type: 'concept',
        title: 'Threat Categories You Need to Recognize Quickly',
        body: '<p>Security+ questions usually reward fast pattern recognition. <strong>Phishing</strong> abuses trust through messages. <strong>Spoofing</strong> impersonates a system or identity. <strong>Password attacks</strong> target authentication workflows. <strong>Reconnaissance</strong> collects information before exploitation.</p><p>When you read a scenario, identify the attacker objective first: steal data, gain execution, move laterally, or disrupt service. The best answer is usually the control that directly interrupts that objective.</p>',
      },
      {
        type: 'bullets',
        title: 'Common Social Engineering Clues',
        items: [
          '<strong>Authority:</strong> the attacker pretends to be a CFO, help desk admin, regulator, or executive.',
          '<strong>Urgency:</strong> the victim is pressured to act before normal verification can happen.',
          '<strong>Fear or reward:</strong> threat of suspension, invoice fraud, gift cards, or payroll problems.',
          '<strong>Channel mismatch:</strong> unusual sender domain, odd MFA prompt, or a request that bypasses normal process.',
          '<strong>Best exam move:</strong> choose user training, call-back verification, or MFA when the weakness is human trust rather than a broken protocol.',
        ],
      },
      {
        type: 'concept',
        title: 'Detective vs. Preventive Controls',
        body: '<p><strong>Preventive controls</strong> try to stop the event before it succeeds, such as MFA, segmentation, ACLs, and application allow lists.</p><p><strong>Detective controls</strong> tell you that something suspicious happened, such as log review, IDS alerts, SIEM correlation, or audit trails.</p><p>A frequent trap is mixing up <strong>IDS</strong> and <strong>IPS</strong>: an IDS watches and alerts; an IPS sits inline and blocks.</p>',
      },
      {
        type: 'quote',
        label: 'Exam Lens',
        text: 'Pick the control that most directly interrupts the attack path, not every control that might help later.',
        source: 'Use the clue in the scenario to decide whether the question is asking for prevention, detection, containment, or recovery.',
      },
      {
        type: 'check',
        q: 'Which attack relies on manipulating ARP tables to intercept LAN traffic? Options: (A) DNS poisoning (B) MAC flooding (C) ARP spoofing (D) Port scanning',
        a: '<strong>(C) ARP spoofing.</strong> The attacker falsifies IP-to-MAC mappings so traffic intended for another host is redirected through the attacker.',
      },
      {
        type: 'check',
        q: 'A phishing email claims to be from the CFO and demands an immediate wire transfer. Which social engineering principle is being exploited? Options: (A) Scarcity (B) Authority (C) Familiarity (D) Obfuscation',
        a: '<strong>(B) Authority.</strong> The message works by borrowing the apparent power of an executive identity and pairing it with urgency to suppress verification.',
      },
      {
        type: 'check',
        q: 'TRUE or FALSE: An intrusion detection system usually blocks malicious traffic inline.',
        a: '<strong>FALSE.</strong> An IDS is primarily detective. Inline blocking is the job of an IPS.',
      },
      {
        type: 'summary',
        title: 'Lesson 1 - Key Takeaways',
        points: [
          'Start with the attacker objective, then choose the control that most directly breaks it.',
          'CIA triad questions usually hinge on whether the issue is disclosure, tampering, or outage.',
          'Authority and urgency are common social engineering triggers.',
          'Preventive controls stop attacks; detective controls surface evidence of them.',
          'IDS alerts, IPS blocks.',
        ],
        cta: 'Move to Lesson 2 for network design, segmentation, least privilege, and zero trust.',
      },
    ],
  },
  {
    id: 'architecture-and-design',
    title: 'Lesson 2',
    subtitle: 'Architecture, Segmentation, and Zero Trust',
    icon: 'AD',
    slides: [
      {
        type: 'intro',
        week: 'Lesson 2 - Architecture and Design',
        question: 'How should systems be arranged so that compromise in one area does not become compromise everywhere?',
        body: 'This lesson focuses on secure design principles: zero trust, segmentation, defense in depth, least privilege, and separation of duties.',
      },
      {
        type: 'term',
        label: 'Key Model',
        term: 'Zero Trust',
        def: 'Zero trust means <strong>never trust, always verify</strong>. Access is not granted just because a user or device is on the internal network. Every request should be evaluated using identity, device health, policy, and context.<br><br>In practice that means continuous verification, strong authentication, and tightly scoped authorization.',
      },
      {
        type: 'concept',
        title: 'Segmentation Shrinks Blast Radius',
        body: '<p><strong>Segmentation</strong> divides infrastructure into smaller trust zones so that one compromise does not automatically expose the rest of the environment.</p><p>This shows up as VLANs, DMZs, microsegmentation, separate management networks, and security groups in cloud deployments. When the question asks how to limit lateral movement or contain a breach, segmentation is often the best answer.</p>',
      },
      {
        type: 'bullets',
        title: 'Design Principles That Reappear on the Exam',
        items: [
          '<strong>Least privilege:</strong> grant only the access needed for the task.',
          '<strong>Separation of duties:</strong> split sensitive actions across multiple roles.',
          '<strong>Defense in depth:</strong> stack controls so one failure does not collapse the whole defense.',
          '<strong>High availability:</strong> add redundancy for critical paths and avoid single points of failure.',
          '<strong>Secure baselines:</strong> harden systems before production instead of fixing drift after deployment.',
        ],
      },
      {
        type: 'concept',
        title: 'Why RBAC Matters in Cloud and Enterprise Environments',
        body: '<p><strong>Role-based access control (RBAC)</strong> maps permissions to roles instead of directly to every user. That makes least privilege and separation of duties far easier to enforce.</p><p>In cloud environments, RBAC also reduces the risk of broad administrative privileges being quietly inherited by service accounts or engineers who only need narrow task-based permissions.</p>',
      },
      {
        type: 'check',
        q: 'Which security control best enforces separation of duties in cloud deployments? Options: (A) RBAC with least privilege roles (B) Multifactor authentication (C) Segmentation gateways (D) Network security groups',
        a: '<strong>(A) RBAC with least privilege roles.</strong> Separation of duties is an authorization design problem, so the best answer is the access model that prevents one person from holding every sensitive permission.',
      },
      {
        type: 'check',
        q: 'A team wants to reduce the impact of a server compromise by isolating workloads into smaller trust zones. Which design principle best fits? Options: (A) Obfuscation (B) Segmentation (C) Availability (D) Repudiation',
        a: '<strong>(B) Segmentation.</strong> The goal is to limit east-west movement and contain the blast radius after a breach.',
      },
      {
        type: 'check',
        q: 'Fill in the blank: In a zero trust model, access is granted with [____] privilege only after [____]. Options: (A) least (B) annualized (C) continuous verification (D) physical escort',
        a: '<strong>(A)</strong> and <strong>(C)</strong>. Zero trust keeps privileges narrow and depends on continuous verification rather than one-time trust based on network location.',
      },
      {
        type: 'summary',
        title: 'Lesson 2 - Key Takeaways',
        points: [
          'Zero trust removes the assumption that internal network location equals trust.',
          'Segmentation is the standard answer when the question is about limiting blast radius or lateral movement.',
          'Least privilege and separation of duties reduce overpowered identities.',
          'RBAC is a practical way to enforce access policy at scale.',
          'Defense in depth assumes at least one control will eventually fail.',
        ],
        cta: 'Next up: implementation details, secure protocols, PKI, MFA, and certificate handling.',
      },
    ],
  },
  {
    id: 'implementation-and-identity',
    title: 'Lesson 3',
    subtitle: 'Implementation, Secure Protocols, and Identity',
    icon: 'IM',
    slides: [
      {
        type: 'intro',
        week: 'Lesson 3 - Implementation and Identity',
        question: 'Which technologies secure communication, prove identity, and harden access?',
        body: 'This lesson covers secure protocol replacements, directory security, PKI concepts, MFA, and certificate pinning.',
      },
      {
        type: 'term',
        label: 'Core Term',
        term: 'Public Key Infrastructure (PKI)',
        def: '<strong>PKI</strong> is the trust framework behind digital certificates. It uses certificate authorities, registration workflows, key pairs, and revocation processes to bind identities to cryptographic keys.<br><br>Security+ questions often test whether PKI is solving <strong>authentication</strong>, <strong>encryption</strong>, <strong>integrity</strong>, or <strong>non-repudiation</strong> in the scenario.',
      },
      {
        type: 'concept',
        title: 'Know the Secure Protocol Replacements',
        body: '<p>Many Security+ questions are direct protocol swaps. <strong>HTTPS</strong> replaces HTTP, <strong>SSH</strong> replaces Telnet, <strong>SFTP</strong> replaces FTP, and <strong>SNMPv3</strong> adds authentication and encryption missing from earlier SNMP versions.</p><p>When a question says the company wants the same service but encrypted, the secure replacement is usually the answer.</p>',
      },
      {
        type: 'bullets',
        title: 'Identity and Access Controls to Distinguish',
        items: [
          '<strong>MFA:</strong> combines factors such as something you know, have, or are.',
          '<strong>SSO:</strong> reduces repeated sign-ins by trusting a central authentication event.',
          '<strong>SAML:</strong> commonly used for browser-based enterprise federation.',
          '<strong>OAuth:</strong> delegates authorization so one service can access another on a user\'s behalf.',
          '<strong>LDAPS:</strong> protects directory traffic with TLS.',
        ],
      },
      {
        type: 'concept',
        title: 'What Certificate Pinning Actually Defends Against',
        body: '<p>Certificate pinning means the client expects a specific certificate or public key rather than trusting any certificate chained to a public CA.</p><p>That helps defend against <strong>man-in-the-middle attacks using rogue or improperly trusted certificates</strong>. It does not fix application logic flaws like SQL injection or privilege escalation.</p>',
      },
      {
        type: 'check',
        q: 'Which protocol secures LDAP communications? Options: (A) LDAPS (B) SFTP (C) Kerberos (D) CHAP',
        a: '<strong>(A) LDAPS.</strong> LDAP by itself is not the secure transport. LDAPS protects the directory communication channel with TLS.',
      },
      {
        type: 'check',
        q: 'What does certificate pinning defend against? Options: (A) Buffer overflow attacks (B) Man-in-the-middle attacks with rogue certificates (C) SQL injection (D) Privilege escalation',
        a: '<strong>(B) Man-in-the-middle attacks with rogue certificates.</strong> Pinning narrows the set of certificates the client will trust, which helps block fraudulent or unexpected certificate chains.',
      },
      {
        type: 'check',
        q: 'TRUE or FALSE: Single sign-on and multifactor authentication mean the same thing.',
        a: '<strong>FALSE.</strong> SSO is about reusing an authentication event across services. MFA is about requiring multiple authentication factors. They can be used together, but they solve different problems.',
      },
      {
        type: 'summary',
        title: 'Lesson 3 - Key Takeaways',
        points: [
          'Protocol substitution questions are usually straightforward: choose the encrypted or authenticated replacement.',
          'PKI binds identities to keys through certificates and trust chains.',
          'MFA strengthens authentication; SSO streamlines reuse of authentication.',
          'SAML and OAuth solve different federation and delegation problems.',
          'Certificate pinning narrows trust to block rogue-certificate MITM attempts.',
        ],
        cta: 'Lesson 4 shifts to operations: incident response, logging, SIEM, and recovery decisions.',
      },
    ],
  },
  {
    id: 'operations-and-response',
    title: 'Lesson 4',
    subtitle: 'Operations, Logging, and Incident Response',
    icon: 'IR',
    slides: [
      {
        type: 'intro',
        week: 'Lesson 4 - Operations and Incident Response',
        question: 'How do you detect incidents quickly, contain them safely, and learn from them afterward?',
        body: 'This lesson covers the incident response lifecycle, useful logging sources, and the difference between containment, eradication, recovery, and lessons learned.',
      },
      {
        type: 'term',
        label: 'Core Workflow',
        term: 'Incident Response Lifecycle',
        def: '<strong>Preparation</strong>, <strong>Identification</strong>, <strong>Containment</strong>, <strong>Eradication</strong>, <strong>Recovery</strong>, and <strong>Lessons Learned</strong>.<br><br>Security+ questions often describe one phase indirectly, so focus on what the team is doing right now, not what happened earlier in the timeline.',
      },
      {
        type: 'concept',
        title: 'How to Distinguish the Response Phases',
        body: '<p><strong>Containment</strong> limits spread. <strong>Eradication</strong> removes the cause, such as malware, accounts, or persistence. <strong>Recovery</strong> restores normal operations safely. <strong>Lessons learned</strong> documents what happened and improves the process afterward.</p><p>The exam frequently offers containment and eradication as adjacent options. If the host is isolated but the root cause still exists, you are not done with eradication yet.</p>',
      },
      {
        type: 'bullets',
        title: 'Log Sources That Matter for Detection',
        items: [
          '<strong>Authentication logs:</strong> failed logins, impossible travel, password spray patterns.',
          '<strong>Web and reverse proxy logs:</strong> request volume, suspicious paths, user-agent anomalies.',
          '<strong>Endpoint telemetry:</strong> process launches, command lines, registry changes, hash detections.',
          '<strong>SIEM correlation:</strong> brings multiple log streams together for broader detection and triage.',
          '<strong>Packet capture:</strong> useful when you need protocol-level detail after an alert.',
        ],
      },
      {
        type: 'concept',
        title: 'SIEM vs. Raw Logs',
        body: '<p>A <strong>SIEM</strong> centralizes logs, normalizes them, correlates events, and raises alerts that would be difficult to catch in a single raw source.</p><p>Raw logs still matter, but SIEM is the better answer when the question is about enterprise-scale visibility, alerting, and linking related indicators across systems.</p>',
      },
      {
        type: 'check',
        q: 'During incident response, which phase focuses on lessons learned and process improvement? Options: (A) Preparation (B) Containment (C) Eradication (D) Post-incident activity',
        a: '<strong>(D) Post-incident activity.</strong> That is the retrospective phase where teams document findings, improve runbooks, and update controls.',
      },
      {
        type: 'check',
        q: 'Select the best logging targets for detecting credential stuffing. Options: (A) Authentication success and failure logs (B) Backup job reports (C) Web server access logs (D) Database performance dashboards',
        a: '<strong>(A)</strong> and <strong>(C)</strong>. Credential stuffing usually appears as unusual authentication patterns plus high-volume web requests. Backup reports and database performance dashboards are much weaker indicators.',
      },
      {
        type: 'check',
        q: 'A compromised endpoint has been isolated from the network, but malware persistence is still present on disk. Which phase best describes the next action?',
        a: 'The next action is <strong>eradication</strong>. Containment already happened when the host was isolated. Eradication removes the malware, persistence mechanism, or attacker foothold.',
      },
      {
        type: 'summary',
        title: 'Lesson 4 - Key Takeaways',
        points: [
          'Identify the incident response phase by what the team is doing now.',
          'Containment limits damage; eradication removes root cause; recovery returns services safely.',
          'Authentication and web logs are strong indicators for credential abuse.',
          'SIEM is the enterprise answer for centralized visibility and event correlation.',
          'Post-incident activity turns incidents into process improvements.',
        ],
        cta: 'The final lesson covers governance, risk, vendor requirements, and recovery planning.',
      },
    ],
  },
  {
    id: 'governance-and-risk',
    title: 'Lesson 5',
    subtitle: 'Governance, Risk, and Recovery Planning',
    icon: 'GR',
    slides: [
      {
        type: 'intro',
        week: 'Lesson 5 - Governance and Risk',
        question: 'How do you turn security goals into policy, measurable risk decisions, and contractual requirements?',
        body: 'This lesson covers risk language, framework questions, vendor governance, and the operational meaning of RTO, RPO, SLE, ARO, and ALE.',
      },
      {
        type: 'term',
        label: 'Risk Formula',
        term: 'ALE = SLE x ARO',
        def: '<strong>Single Loss Expectancy (SLE)</strong> estimates the cost of one event. <strong>Annualized Rate of Occurrence (ARO)</strong> estimates how often it happens in a year. <strong>Annualized Loss Expectancy (ALE)</strong> estimates the expected yearly loss.<br><br>This formula is a common exam shortcut for comparing control cost to expected risk.',
      },
      {
        type: 'concept',
        title: 'Framework Questions Usually Want the Best Fit',
        body: '<p>Security+ framework questions are usually asking which option best matches the organization\'s stated goal. In this project\'s seed content, the risk-based control framework most associated with US cybersecurity practice is <strong>NIST CSF</strong>.</p><p>Do not overcomplicate these questions. If the clue is risk-based controls in the United States, NIST CSF is the clean answer.</p>',
      },
      {
        type: 'bullets',
        title: 'Documents and Metrics You Should Not Confuse',
        items: [
          '<strong>Security addendum:</strong> contract language that requires vendor security controls.',
          '<strong>SLA:</strong> defines expected service performance and uptime targets.',
          '<strong>SOW:</strong> states the work to be performed.',
          '<strong>RTO:</strong> how quickly service must be restored after disruption.',
          '<strong>RPO:</strong> how much data loss is tolerable, measured in time.',
        ],
      },
      {
        type: 'concept',
        title: 'Why Business Impact Analysis Matters',
        body: '<p>A <strong>business impact analysis (BIA)</strong> identifies critical functions, dependencies, tolerable downtime, and the business consequences of disruption.</p><p>BIA informs continuity planning because it tells you which systems need the shortest RTO and lowest RPO, and which services can recover more slowly without unacceptable harm.</p>',
      },
      {
        type: 'check',
        q: 'Which framework is most associated with risk-based cybersecurity controls in the United States? Options: (A) ISO/IEC 27001 (B) NIST CSF (C) COBIT (D) ITIL',
        a: '<strong>(B) NIST CSF.</strong> That is the best fit when the prompt emphasizes US risk-based cybersecurity controls.',
      },
      {
        type: 'check',
        q: 'A company wants to ensure vendors follow minimum security practices. Which document formalizes this? Options: (A) SOW (B) SLA (C) MOU (D) Security addendum',
        a: '<strong>(D) Security addendum.</strong> The security addendum is the contract mechanism that imposes explicit security requirements on the vendor.',
      },
      {
        type: 'check',
        q: 'Fill in the blank: Annualized Loss Expectancy (ALE) equals Single Loss Expectancy (SLE) multiplied by [____]. Options: (A) annualized rate of occurrence (ARO) (B) recovery point objective (RPO) (C) mean time to recover (MTTR) (D) service level agreement (SLA)',
        a: '<strong>(A)</strong> annualized rate of occurrence. ALE estimates expected yearly loss, so it multiplies the loss of one event by how often that event happens in a year.',
      },
      {
        type: 'summary',
        title: 'Lesson 5 - Key Takeaways',
        points: [
          'Use the prompt to choose the framework or governance document that best fits the stated need.',
          'ALE uses the simple formula SLE x ARO.',
          'Security addenda impose vendor security requirements; SLAs describe service expectations.',
          'RTO is about time to restore service; RPO is about acceptable data loss.',
          'BIA tells you which business functions are most critical and how fast they must recover.',
        ],
        cta: 'You now have a guided Security+ lesson path that complements test creation, analytics, acronyms, and question bank review.',
      },
    ],
  },
];

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

  SECURITY_PLUS_LESSONS.forEach((lesson, lessonIndex) => {
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
