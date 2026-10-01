/**
 * Secondary, additive scope: one flat SVG mark per `ObjectKind` for the small payload_collection
 * tiles. Zero WebGL, no new dependency, no image file — live per-tile canvases are ruled out
 * permanently (23 contexts would exceed the browser cap).
 *
 * `SHOW_TILE_GLYPHS` is the one-line kill switch: flip it to `false` and the tiles are byte-identical
 * to before this feature.
 */

import type { ObjectKind } from './repo-object-kind';

export const SHOW_TILE_GLYPHS = true;

/** `Record<ObjectKind, string>`, so a missing glyph is a compile error like the builder registry. */
const GLYPH_PATHS: Record<ObjectKind, string> = {
  esp32_board: 'M3 7h18v10H3zM7.5 10.5h5v3h-5zM6 7V5M10 7V5M14 7V5M18 7V5M6 19v-2M10 19v-2M14 19v-2M18 19v-2',
  kernel_phone: 'M3 3h8v18H3zM5 18h4M16.5 8.5v-2M16.5 17.5v-2M20 12h-1.5M14.5 12H13M17 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5',
  mobile_app: 'M6 2h12v20H6zM9 6h3v3H9zM14 6h1.5v3H14zM9 12h3v3H9zM14 12h1.5v3H14zM10 19h4',
  osint_phone: 'M4 3h9v18H4zM6 18h5M17 7a4 4 0 1 0 0 8a4 4 0 1 0 0-8M20 18l-2.5-2.5',
  bot_head: 'M5 8h14v10H5zM9 12h1M14 12h1M12 8V5M12 4a1 1 0 1 0 0 2a1 1 0 1 0 0-2M9 21h6',
  git_bot: 'M3 6h7v6H3zM5 9h.5M8 9h.5M6.5 6V4M3 18h18M7 18a1.5 1.5 0 1 0 0 .01M13 18a1.5 1.5 0 1 0 0 .01M19 18a1.5 1.5 0 1 0 0 .01M13 18v-4h6',
  cricket_kit: 'M4 20l7-7M3.5 19.5l1 1M10 12l3-3M17 4h5l-.5 4a2 2 0 0 1-4 0zM19.5 12v-4M17 20h5M19.5 20v-4M8 6a2 2 0 1 0 0 4a2 2 0 1 0 0-4',
  crypto_coin: 'M12 3a5 9 0 1 0 0 18a5 9 0 1 0 0-18M9.5 9l2.5 4 2.5-4M9.5 16h5',
  travel_globe: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M3 12h18M12 3a14 9 0 0 1 0 18a14 9 0 0 1 0-18',
  water_system: 'M9 3c3 4 4 5.5 4 7.5a4 4 0 0 1-8 0C5 8.5 6 7 9 3M14 17h7v4h-7zM14 19H9v-4',
  weather_sky: 'M6 13a3.5 3.5 0 0 1 .5-7a5 5 0 0 1 9.5 1a3 3 0 0 1 0 6zM8 17l-1 3M12 17l-1 3M16 17l-1 3',
  book_study: 'M12 6c-2-2-5-2.5-8-2v13c3-.5 6 0 8 2c2-2 5-2.5 8-2V4c-3-.5-6 0-8 2zM12 6v13',
  document_sheet: 'M6 3h9l4 4v14H6zM15 3v4h4M9 12h7M9 15h7M9 18h4',
  game_pad: 'M7 8h10a5 5 0 0 1 0 10a3 3 0 0 1-2-1H9a3 3 0 0 1-2 1a5 5 0 0 1 0-10M9 13h3M10.5 11.5v3M16 12h.5M18 14h.5',
  seat_matrix: 'M4 4h16v3H4zM5 11h3v3H5zM10.5 11h3v3h-3zM16 11h3v3h-3zM5 17h3v3H5zM10.5 17h3v3h-3zM16 17h3v3h-3z',
  security_lock: 'M6 11h12v10H6zM9 11V8a3 3 0 0 1 6 0v3M12 15v2',
  ai_core: 'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6M12 9V4M12 15v5M9.5 10.5L5 7M14.5 10.5L19 7M9.5 13.5L5 17M14.5 13.5L19 17M12 3a1 1 0 1 0 0 .01M4 6a1 1 0 1 0 0 .01M20 6a1 1 0 1 0 0 .01M4 18a1 1 0 1 0 0 .01M20 18a1 1 0 1 0 0 .01',
  database_stack: 'M12 3c4 0 7 1 7 2.5S16 8 12 8S5 6.5 5 5.5S8 3 12 3M5 5.5v13C5 20 8 21 12 21s7-1 7-2.5v-13M5 12c0 1.5 3 2.5 7 2.5s7-1 7-2.5',
  analytics_bars: 'M4 20h16M6 20v-5M10 20v-9M14 20v-6M18 20v-12',
  react_atom: 'M12 11a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3M12 6.5c5 0 9 2.5 9 6s-4 6-9 6s-9-2.5-9-6s4-6 9-6M7 4.5c2.5-1.5 6.5 1.5 9 6s2.5 9-0 10.5M17 4.5c-2.5-1.5-6.5 1.5-9 6s-2.5 9 0 10.5',
  server_rack: 'M4 4h16v5H4zM4 11h16v5H4zM4 18h16v3H4zM7 6.5h.5M7 13.5h.5M7 19.5h.5M16 6.5h2M16 13.5h2',
  browser_window: 'M3 5h18v14H3zM3 9h18M5.5 7h.5M8 7h.5M10.5 7h.5M6 12h5M6 15h8',
  cli_terminal: 'M3 5h18v14H3zM6 10l2 2l-2 2M11 14h6',
  lang_ts_badge: 'M4 4h16v16H4zM7 9h5M9.5 9v7M15 9.5a2 2 0 0 0-1 3.5c1.5.8 2 1.2 2 2a2 2 0 0 1-3 .5',
  lang_js_badge: 'M4 4h16v16H4zM11 9v5a2 2 0 0 1-3 1M17 9.5a2 2 0 0 0-1 3.5c1.5.8 2 1.2 2 2a2 2 0 0 1-3 .5',
  lang_python_ribbons: 'M12 3h3a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H9a2 2 0 0 0-2 2v5M12 21H9a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h6a2 2 0 0 0 2-2V5M10 6h.5M14 18h.5',
  lang_html_shield: 'M5 3h14l-1.5 16L12 21l-5.5-2zM15 8H9v4h5.5l-.5 3.5l-2 .7l-2-.7',
  lang_code_prism: 'M8 5L3 12l5 7M16 5l5 7l-5 7M13.5 6l-3 12',
  generic_prism: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 3v18M4 7.5l8 4.5l8-4.5',
};

/** Decorative per-kind mark, in the same visual language as the tile's lucide icons. */
export function RepoKindGlyph({ kind, className }: { kind: ObjectKind; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={GLYPH_PATHS[kind]} />
    </svg>
  );
}
