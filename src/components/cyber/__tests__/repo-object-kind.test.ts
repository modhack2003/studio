/**
 * @jest-environment node
 *
 * Running in the bare `node` environment is itself the proof that the classifier imports nothing
 * browser-, React- or three-bound (AC7).
 */

import {
  CLASSIFIER_RULES,
  KIND_PRIORITY,
  LANGUAGE_COLORS,
  OBJECT_KINDS,
  classifyRepoObject,
  languageAccent,
  safeClassifyRepoObject,
  type ObjectKind,
  type RepoObjectInput,
} from '../repo-object-kind';

describe('classifyRepoObject — the owner\'s real repositories', () => {
  const REAL_REPOS: [string, RepoObjectInput, ObjectKind][] = [
    ['NEXUSS_ESP32', { name: 'NEXUSS_ESP32' }, 'esp32_board'],
    ['Cricket-bid', { name: 'Cricket-bid' }, 'cricket_kit'],
    ['Eliot_THE_AI', { name: 'Eliot_THE_AI' }, 'ai_core'],
    ['Generative_ai', { name: 'Generative_ai' }, 'ai_core'],
    ['ContentCraft-AI-BACKEND', { name: 'ContentCraft-AI-BACKEND' }, 'ai_core'],
    ['phoneinfoga', { name: 'phoneinfoga' }, 'osint_phone'],
    ['water_system', { name: 'water_system' }, 'water_system'],
    ['weathering_with_you', { name: 'weathering_with_you' }, 'weather_sky'],
    ['Solana_CoinFlip_Game-', { name: 'Solana_CoinFlip_Game-' }, 'crypto_coin'],
    ['poco-m6-plus-kernel-', { name: 'poco-m6-plus-kernel-' }, 'kernel_phone'],
    ['travelhub.com', { name: 'travelhub.com' }, 'travel_globe'],
    ['resume', { name: 'resume' }, 'document_sheet'],
    ['Project_temp_site', { name: 'Project_temp_site' }, 'document_sheet'],
    ['EXAM_HELPER', { name: 'EXAM_HELPER' }, 'book_study'],
    ['meet_bot', { name: 'meet_bot' }, 'bot_head'],
    ['Git_bot', { name: 'Git_bot' }, 'git_bot'],
    ['CURD_APP', { name: 'CURD_APP' }, 'database_stack'],
    ['ezyMetrics-backend', { name: 'ezyMetrics-backend' }, 'analytics_bars'],
    ['first_react', { name: 'first_react' }, 'react_atom'],
    ['seatsync_engine_demo', { name: 'seatsync_engine_demo' }, 'seat_matrix'],
    // no domain signal -> the language's tech-stack object
    ['studio', { name: 'studio', language: 'TypeScript' }, 'lang_ts_badge'],
    ['cleverBooks_project', { name: 'cleverBooks_project', language: 'JavaScript' }, 'lang_js_badge'],
    ['face_page_dashbord', { name: 'face_page_dashbord', language: 'TypeScript' }, 'lang_ts_badge'],
    ['mismi', { name: 'mismi' }, 'generic_prism'],
  ];

  it.each(REAL_REPOS)('%s', (_label, input, expected) => {
    expect(classifyRepoObject(input)).toBe(expected);
  });

  it('does not false-match near misses', () => {
    // "cleverBooks" must not read as a study repo, "dashbord" must not read as a dashboard
    expect(classifyRepoObject({ name: 'cleverBooks_project' })).toBe('generic_prism');
    expect(classifyRepoObject({ name: 'face_page_dashbord' })).toBe('generic_prism');
  });
});

describe('classifyRepoObject — category coverage', () => {
  const CATEGORIES: [string, RepoObjectInput, ObjectKind][] = [
    ['embedded', { name: 'sensor-node', description: 'arduino firmware' }, 'esp32_board'],
    ['sport', { topics: ['cricket', 'ipl'] }, 'cricket_kit'],
    ['frontend', { topics: ['frontend'] }, 'browser_window'],
    ['backend', { description: 'rest api server built with express' }, 'server_rack'],
    ['machine learning', { topics: ['machine-learning'] }, 'ai_core'],
    ['security', { topics: ['ctf', 'pentest'] }, 'security_lock'],
    ['mobile', { name: 'expense-tracker', topics: ['flutter', 'android'] }, 'mobile_app'],
    ['cli', { topics: ['cli', 'automation'] }, 'cli_terminal'],
    ['game', { name: 'snake-game' }, 'game_pad'],
    ['docs', { name: 'my-dotfiles' }, 'document_sheet'],
    ['study', { description: 'exam syllabus notes' }, 'book_study'],
    ['crypto', { name: 'solana-wallet' }, 'crypto_coin'],
    ['generic', {}, 'generic_prism'],
  ];

  it.each(CATEGORIES)('%s', (_label, input, expected) => {
    expect(classifyRepoObject(input)).toBe(expected);
  });
});

describe('classifyRepoObject — precedence', () => {
  it('a domain signal beats the language fallback', () => {
    expect(classifyRepoObject({ customTags: ['iot'], language: 'TypeScript' })).toBe('esp32_board');
  });

  it('topics outrank free-text description', () => {
    expect(classifyRepoObject({ topics: ['cricket'], description: 'an api server' })).toBe('cricket_kit');
  });

  it('customTags outrank topics', () => {
    expect(classifyRepoObject({ customTags: ['security'], topics: ['website'] })).toBe('security_lock');
  });

  it('a stronger rule wins over a generic one in the same field', () => {
    expect(classifyRepoObject({ name: 'Git_bot' })).toBe('git_bot');
    expect(classifyRepoObject({ name: 'Solana_CoinFlip_Game-' })).toBe('crypto_coin');
    expect(classifyRepoObject({ name: 'ezyMetrics-backend' })).toBe('analytics_bars');
  });

  it('resolves an equal-score security/study tie towards security', () => {
    // a hand-picked field project tagged both ways is recon work with notes, not coursework
    expect(classifyRepoObject({ customTags: ['RECON', 'NOTES'] })).toBe('security_lock');
  });

  it('honours a curator override in customTags only', () => {
    expect(classifyRepoObject({ customTags: ['object:crypto_coin'], name: 'cricket-scores' })).toBe('crypto_coin');
    expect(classifyRepoObject({ customTags: ['esp32_board'] })).toBe('esp32_board');
    expect(classifyRepoObject({ customTags: ['esp32 board'] })).toBe('esp32_board');
    // an ordinary GitHub topic must not be able to steer the object
    expect(classifyRepoObject({ topics: ['crypto_coin'], name: 'Cricket-bid' })).toBe('cricket_kit');
  });
});

describe('classifyRepoObject — normalisation', () => {
  it('is case- and separator-insensitive', () => {
    for (const name of ['ESP-32', 'esp_32', 'esp32', 'ESP 32', 'Esp32-Board']) {
      expect(classifyRepoObject({ name })).toBe('esp32_board');
    }
  });

  it('truncates long readme excerpts, so a signal past the limit does not match', () => {
    const far = `${'filler '.repeat(400)} cricket`;
    expect(far.length).toBeGreaterThan(1000);
    expect(classifyRepoObject({ readmeExcerpt: far })).toBe('generic_prism');
    expect(classifyRepoObject({ readmeExcerpt: 'cricket scoring app' })).toBe('cricket_kit');
  });
});

describe('classifyRepoObject — language fallback', () => {
  const LANGS: [string, ObjectKind][] = [
    ['TypeScript', 'lang_ts_badge'],
    ['JavaScript', 'lang_js_badge'],
    ['Python', 'lang_python_ribbons'],
    ['HTML', 'lang_html_shield'],
    ['CSS', 'lang_code_prism'],
    ['EJS', 'lang_code_prism'],
    ['C++', 'lang_code_prism'],
    ['Go', 'lang_code_prism'],
    ['Vue', 'lang_code_prism'],
  ];

  it.each(LANGS)('%s', (language, expected) => {
    expect(classifyRepoObject({ name: 'quiet-repo', language })).toBe(expected);
  });

  it('falls through to the generic object for an unknown language', () => {
    expect(classifyRepoObject({ name: 'quiet-repo', language: 'Jupyter Notebook' })).toBe('generic_prism');
  });

  it('resolves the accent from LANGUAGE_COLORS and defaults to cyan', () => {
    expect(languageAccent('TypeScript')).toBe(LANGUAGE_COLORS.TypeScript);
    expect(languageAccent('Jupyter Notebook')).toBe('#1fd6c6');
    expect(languageAccent(null)).toBe('#1fd6c6');
    expect(languageAccent('constructor')).toBe('#1fd6c6');
  });
});

describe('classifyRepoObject — totality and determinism', () => {
  it('never throws for missing or wrongly typed input', () => {
    const bad: unknown[] = [
      undefined,
      null,
      {},
      { name: 42, description: {}, topics: 'not-an-array', customTags: [1, 2], readmeExcerpt: [] },
      { topics: [null, undefined, 'cricket'] },
      { customTags: null, language: 99 },
    ];
    for (const input of bad) {
      expect(OBJECT_KINDS).toContain(classifyRepoObject(input as RepoObjectInput));
    }
    expect(classifyRepoObject({ topics: [null, undefined, 'cricket'] as unknown as string[] })).toBe('cricket_kit');
  });

  it('is deterministic for equal inputs', () => {
    const input: RepoObjectInput = { name: 'NEXUSS_ESP32', description: 'iot board', language: 'C++' };
    expect(classifyRepoObject(input)).toBe(classifyRepoObject(input));
    expect(classifyRepoObject({ ...input })).toBe(classifyRepoObject(input));
  });

  it('safeClassifyRepoObject mirrors classifyRepoObject', () => {
    expect(safeClassifyRepoObject({ name: 'Cricket-bid' })).toBe('cricket_kit');
    expect(safeClassifyRepoObject(null)).toBe('generic_prism');
  });
});

describe('rule table invariants', () => {
  it('KIND_PRIORITY is a permutation of OBJECT_KINDS', () => {
    expect([...KIND_PRIORITY].sort()).toEqual([...OBJECT_KINDS].sort());
    expect(new Set(KIND_PRIORITY).size).toBe(OBJECT_KINDS.length);
  });

  it('every substring pattern is long and unambiguous enough to be safe', () => {
    for (const rule of CLASSIFIER_RULES) {
      for (const re of rule.tight ?? []) {
        expect(re.source).toMatch(/^[a-z0-9]+$/);
        expect(re.source.length).toBeGreaterThanOrEqual(5);
      }
    }
  });

  it('leaves the language and generic kinds rule-free, so a domain signal always outranks them', () => {
    const ruleKinds = new Set(CLASSIFIER_RULES.map((r) => r.kind));
    for (const kind of ['lang_ts_badge', 'lang_js_badge', 'lang_python_ribbons', 'lang_html_shield', 'lang_code_prism', 'generic_prism'] as ObjectKind[]) {
      expect(ruleKinds.has(kind)).toBe(false);
    }
  });
});
