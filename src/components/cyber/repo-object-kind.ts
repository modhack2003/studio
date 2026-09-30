/**
 * Contextual 3D object classifier for the projects showcase.
 *
 * Pure, synchronous and side-effect free: this module imports **nothing** (no `three`, no `react`,
 * no `next`, no Prisma) and touches no browser API, so it is safe to call during SSR / render and is
 * unit-testable in a bare Node environment. It never throws for any input.
 *
 * Signals come only from fields already synced into `GitHubRepository` (name, description, language,
 * topics, readmeExcerpt, customTags) or, for hand-picked `Project` rows, from title/description/tags.
 * `homepage` is deliberately unused — it adds no signal the other fields do not already carry.
 */

export type ObjectKind =
  | 'esp32_board'
  | 'kernel_phone'
  | 'mobile_app'
  | 'osint_phone'
  | 'bot_head'
  | 'git_bot'
  | 'cricket_kit'
  | 'crypto_coin'
  | 'travel_globe'
  | 'water_system'
  | 'weather_sky'
  | 'book_study'
  | 'document_sheet'
  | 'game_pad'
  | 'seat_matrix'
  | 'security_lock'
  | 'ai_core'
  | 'database_stack'
  | 'analytics_bars'
  | 'react_atom'
  | 'server_rack'
  | 'browser_window'
  | 'cli_terminal'
  | 'lang_ts_badge'
  | 'lang_js_badge'
  | 'lang_python_ribbons'
  | 'lang_html_shield'
  | 'lang_code_prism'
  | 'generic_prism';

export const FALLBACK_KIND: ObjectKind = 'generic_prism';

export const OBJECT_KINDS: readonly ObjectKind[] = Object.freeze([
  'esp32_board',
  'kernel_phone',
  'mobile_app',
  'osint_phone',
  'bot_head',
  'git_bot',
  'cricket_kit',
  'crypto_coin',
  'travel_globe',
  'water_system',
  'weather_sky',
  'book_study',
  'document_sheet',
  'game_pad',
  'seat_matrix',
  'security_lock',
  'ai_core',
  'database_stack',
  'analytics_bars',
  'react_atom',
  'server_rack',
  'browser_window',
  'cli_terminal',
  'lang_ts_badge',
  'lang_js_badge',
  'lang_python_ribbons',
  'lang_html_shield',
  'lang_code_prism',
  'generic_prism',
] as ObjectKind[]);

/**
 * Tie-break order, most specific first. A rule-bearing domain kind always precedes the generic
 * language kinds, so an equal score resolves towards the more specific object.
 */
export const KIND_PRIORITY: readonly ObjectKind[] = Object.freeze([
  'esp32_board',
  'osint_phone',
  'git_bot',
  'kernel_phone',
  'cricket_kit',
  'water_system',
  'weather_sky',
  'crypto_coin',
  'travel_globe',
  'seat_matrix',
  'book_study',
  'security_lock',
  'ai_core',
  'analytics_bars',
  'database_stack',
  'react_atom',
  'bot_head',
  'mobile_app',
  'game_pad',
  'document_sheet',
  'server_rack',
  'browser_window',
  'cli_terminal',
  'lang_ts_badge',
  'lang_js_badge',
  'lang_python_ribbons',
  'lang_html_shield',
  'lang_code_prism',
  'generic_prism',
] as ObjectKind[]);

export interface RepoObjectInput {
  /** repo name (bare, not `owner/name`) or a hand-picked project title */
  name?: string | null;
  description?: string | null;
  language?: string | null;
  topics?: readonly string[] | null;
  readmeExcerpt?: string | null;
  /** curator-controlled tags; `Project.tags` for hand-picked rows */
  customTags?: readonly string[] | null;
}

/* -------------------------------------------------------------------------- */
/* Normalisation                                                               */
/* -------------------------------------------------------------------------- */

/** 'ESP-32' -> 'esp 32'. Word-ish haystack, matched by `\b`-anchored patterns. */
const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
/** 'esp 32' -> 'esp32'. Separator-blind haystack, matched by plain substring patterns. */
const tight = (w: string) => w.replace(/ /g, '');

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');

const strArray = (v: unknown, maxEntries: number, maxLen: number): string[] =>
  Array.isArray(v) ? v.filter((e): e is string => typeof e === 'string').slice(0, maxEntries).map((e) => e.slice(0, maxLen)) : [];

interface Haystack {
  words: string;
  tight: string;
}

/** Entries are tightened individually and joined with `|` so no match can span two entries. */
function haystackOf(parts: string[]): Haystack {
  const w = parts.map(words).filter(Boolean);
  return { words: w.join(' | '), tight: w.map(tight).join('|') };
}

/* -------------------------------------------------------------------------- */
/* Rules                                                                       */
/* -------------------------------------------------------------------------- */

export interface ClassifierRule {
  kind: ObjectKind;
  strength: 1 | 2 | 3;
  /** matched against the word-ish haystack; always `\b`-anchored */
  words?: readonly RegExp[];
  /** matched against the separator-free haystack; lowercase alphanumeric, >= 5 chars */
  tight?: readonly RegExp[];
}

/**
 * One row per rule-bearing kind. The five `lang_*` kinds and `generic_prism` deliberately carry no
 * rules — they are reachable only from the language / generic fallbacks, which is what structurally
 * guarantees "a domain signal always beats a language match".
 */
export const CLASSIFIER_RULES: readonly ClassifierRule[] = Object.freeze([
  { kind: 'git_bot', strength: 3, words: [/\bgit ?bot\b/], tight: [/gitbot/] },
  { kind: 'osint_phone', strength: 3, words: [/\bosint\b/, /\bphone ?infoga\b/], tight: [/phoneinfoga/, /osint/] },
  {
    kind: 'esp32_board',
    strength: 3,
    words: [/\besp ?32\b/, /\besp ?8266\b/, /\barduino\b/, /\bfirmware\b/, /\bmicrocontroller\b/, /\bsensors?\b/, /\biot\b/],
    tight: [/esp32/, /arduino/, /microcontroller/],
  },
  { kind: 'kernel_phone', strength: 3, words: [/\bkernel\b/, /\bpoco\b/, /\bcustom rom\b/, /\brecovery\b/], tight: [/kernel/] },
  { kind: 'cricket_kit', strength: 3, words: [/\bcricket\b/, /\bipl\b/, /\bbatsman\b/, /\bwickets?\b/], tight: [/cricket/] },
  { kind: 'water_system', strength: 3, words: [/\bwater/, /\birrigation\b/, /\bborewell\b/], tight: [/waterlevel/, /watersystem/, /irrigation/] },
  { kind: 'weather_sky', strength: 3, words: [/\bweather/, /\bforecast\b/, /\bclimate\b/, /\brainfall\b/], tight: [/weather/, /forecast/] },
  {
    kind: 'crypto_coin',
    strength: 2,
    words: [/\bsolana\b/, /\bcoin ?flip\b/, /\bcrypto\b/, /\bblockchain\b/, /\bweb3\b/, /\bwallet\b/, /\bnft\b/, /\bsolidity\b/],
    tight: [/coinflip/, /blockchain/, /solana/],
  },
  { kind: 'travel_globe', strength: 2, words: [/\btravel/, /\bflights?\b/, /\btourism\b/, /\bitinerary\b/], tight: [/travel/, /flight/, /itinerary/, /airport/] },
  { kind: 'seat_matrix', strength: 2, words: [/\bseat/, /\bbookings?\b/, /\breservation\b/], tight: [/seatsync/, /booking/] },
  { kind: 'book_study', strength: 2, words: [/\bexam\b/, /\bsyllabus\b/, /\bstudy\b/, /\bnotes\b/, /\bcourse\b/, /\btutorial\b/], tight: [/syllabus/, /semester/] },
  {
    kind: 'security_lock',
    strength: 2,
    words: [/\bctf\b/, /\bpentest/, /\bvapt\b/, /\bexploits?\b/, /\brecon\b/, /\bxss\b/, /\bnmap\b/, /\bsecurity\b/, /\bmalware\b/],
    tight: [/pentest/, /exploit/, /vulnerab/, /cybersec/],
  },
  {
    kind: 'ai_core',
    strength: 2,
    words: [/\bai\b/, /\bllm\b/, /\bgpt\b/, /\bneural\b/, /\bml\b/, /\bgenerative\b/],
    tight: [/generative/, /machinelearning/, /neural/, /tensorflow/],
  },
  { kind: 'analytics_bars', strength: 2, words: [/\banalytics\b/, /\bmetrics\b/, /\bdashboard\b/, /\bcharts?\b/, /\breports?\b/], tight: [/metrics/, /analytic/, /dashboard/] },
  { kind: 'database_stack', strength: 2, words: [/\b(crud|curd)\b/, /\bdatabase\b/, /\bsql\b/, /\bmongo/, /\bprisma\b/], tight: [/database/, /mongodb/, /postgres/] },
  { kind: 'react_atom', strength: 2, words: [/\breact\b/, /\breactjs\b/] },
  { kind: 'bot_head', strength: 2, words: [/\bbots?\b/, /\bchatbot\b/, /\bautomaton\b/], tight: [/chatbot/] },
  { kind: 'mobile_app', strength: 2, words: [/\bandroid\b/, /\bios\b/, /\bflutter\b/, /\breact native\b/, /\bapk\b/], tight: [/flutter/, /reactnative/] },
  { kind: 'document_sheet', strength: 2, words: [/\bresume\b/, /\bcv\b/, /\btemp site\b/, /\btemplate\b/, /\bdocs?\b/, /\bdotfiles\b/], tight: [/template/, /dotfiles/, /markdown/] },
  { kind: 'game_pad', strength: 1, words: [/\bgames?\b/, /\barcade\b/, /\bunity\b/, /\bpuzzle\b/], tight: [/gameplay/] },
  { kind: 'server_rack', strength: 1, words: [/\bbackend\b/, /\bapi\b/, /\bserver\b/, /\bexpress\b/, /\brest\b/, /\bmicroservices?\b/], tight: [/backend/, /express/, /restapi/] },
  {
    kind: 'browser_window',
    strength: 1,
    words: [/\bfrontend\b/, /\bwebsite\b/, /\blanding\b/, /\bnext ?js\b/, /\bportfolio\b/, /\bwebpage\b/],
    tight: [/frontend/, /website/, /portfolio/, /landingpage/],
  },
  { kind: 'cli_terminal', strength: 1, words: [/\bcli\b/, /\bbash\b/, /\bscripts?\b/, /\bautomation\b/, /\btooling\b/, /\bshell\b/], tight: [/automation/, /commandline/] },
] as ClassifierRule[]);

type Field = 'customTags' | 'topics' | 'name' | 'description' | 'readmeExcerpt';

const FIELD_ORDER: readonly Field[] = ['customTags', 'topics', 'name', 'description', 'readmeExcerpt'];
const FIELD_WEIGHT: Record<Field, number> = { customTags: 8, topics: 6, name: 5, description: 3, readmeExcerpt: 2 };

/** Language → generic tech-stack object, used only when no domain rule scored. */
const LANGUAGE_KIND: Record<string, ObjectKind> = {
  TypeScript: 'lang_ts_badge',
  JavaScript: 'lang_js_badge',
  Python: 'lang_python_ribbons',
  HTML: 'lang_html_shield',
  CSS: 'lang_code_prism',
  EJS: 'lang_code_prism',
  Shell: 'lang_code_prism',
  C: 'lang_code_prism',
  'C++': 'lang_code_prism',
  Java: 'lang_code_prism',
  Go: 'lang_code_prism',
  Rust: 'lang_code_prism',
  Solidity: 'lang_code_prism',
  Dart: 'lang_code_prism',
  Vue: 'lang_code_prism',
  PHP: 'lang_code_prism',
};

/** A colour per language so the preview panel reads like a GitHub repo card. */
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F1E05A',
  Python: '#3572A5',
  HTML: '#E34C26',
  CSS: '#563D7C',
  EJS: '#A91E50',
  Shell: '#89E051',
  C: '#555555',
  'C++': '#F34B7D',
  Java: '#B07219',
  Go: '#00ADD8',
  Rust: '#DEA584',
  Solidity: '#AA6746',
  Dart: '#00B4AB',
  Vue: '#41B883',
  PHP: '#4F5D95',
};

const own = (map: Record<string, string>, key: string) =>
  Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined;

/** Hex accent for the 3D object (`three` cannot parse `hsl(var(--cyan))`). Defaults to cyan. */
export function languageAccent(language?: string | null): string {
  const key = typeof language === 'string' ? language.trim() : '';
  return (key && own(LANGUAGE_COLORS, key)) || '#1fd6c6';
}

/* -------------------------------------------------------------------------- */
/* Classification                                                              */
/* -------------------------------------------------------------------------- */

/** `esp32_board` -> `esp32 board`, so a curator tag can name a kind in either spelling. */
const KIND_BY_SLUG: Record<string, ObjectKind> = OBJECT_KINDS.reduce<Record<string, ObjectKind>>((acc, kind) => {
  acc[words(kind)] = kind;
  return acc;
}, {});

/** Documented steering hatch: a curator-controlled tag may name the kind outright. */
function curatorOverride(tags: string[]): ObjectKind | null {
  for (const tag of tags) {
    const w = words(tag).replace(/^object /, '');
    if (Object.prototype.hasOwnProperty.call(KIND_BY_SLUG, w)) return KIND_BY_SLUG[w];
  }
  return null;
}

const matches = (rule: ClassifierRule, hay: Haystack) =>
  (rule.words?.some((re) => re.test(hay.words)) ?? false) || (rule.tight?.some((re) => re.test(hay.tight)) ?? false);

const priority = (kind: ObjectKind) => {
  const i = KIND_PRIORITY.indexOf(kind);
  return i < 0 ? KIND_PRIORITY.length : i;
};

/**
 * Maps a repository's metadata to exactly one `ObjectKind`. Deterministic, total, and bounded:
 * inputs are truncated before matching, so the regex work is constant-ish regardless of README size.
 */
export function classifyRepoObject(input?: RepoObjectInput | null): ObjectKind {
  if (!input || typeof input !== 'object') return FALLBACK_KIND;

  const tags = strArray(input.customTags, 30, 60);
  const override = curatorOverride(tags);
  if (override) return override;

  const fields: Record<Field, Haystack> = {
    customTags: haystackOf(tags),
    topics: haystackOf(strArray(input.topics, 30, 60)),
    name: haystackOf([str(input.name, 200)]),
    description: haystackOf([str(input.description, 500)]),
    readmeExcerpt: haystackOf([str(input.readmeExcerpt, 1000)]),
  };

  // A rule scores at most once per field, so a README repeating a word cannot run away.
  const scores = new Map<ObjectKind, number>();
  for (const rule of CLASSIFIER_RULES) {
    let score = 0;
    for (const field of FIELD_ORDER) {
      if (matches(rule, fields[field])) score += FIELD_WEIGHT[field] * rule.strength;
    }
    if (score > 0) scores.set(rule.kind, (scores.get(rule.kind) ?? 0) + score);
  }

  let best: ObjectKind | null = null;
  let bestScore = 0;
  for (const [kind, score] of Array.from(scores.entries())) {
    const wins = best === null ? score > bestScore : score > bestScore || (score === bestScore && priority(kind) < priority(best));
    if (wins) {
      best = kind;
      bestScore = score;
    }
  }
  if (best) return best;

  const language = str(input.language, 60).trim();
  if (language && Object.prototype.hasOwnProperty.call(LANGUAGE_KIND, language)) return LANGUAGE_KIND[language];

  return FALLBACK_KIND;
}

/** Never-throwing wrapper for call sites that classify untrusted DB rows during render. */
export function safeClassifyRepoObject(input?: RepoObjectInput | null): ObjectKind {
  try {
    return classifyRepoObject(input);
  } catch (error) {
    console.error('repo object classification failed', error);
    return FALLBACK_KIND;
  }
}
