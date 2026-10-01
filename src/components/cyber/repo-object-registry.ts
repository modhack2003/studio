/**
 * Exactly one builder per `ObjectKind`. Being a `Record<ObjectKind, ObjectBuilder>`, adding a kind
 * without a builder is a compile error rather than a blank preview.
 */

import type { ObjectKind } from './repo-object-kind';
import type { BuildContext, BuiltObject, ObjectBuilder } from './repo-object-kit';
import { FALLBACK_KIND } from './repo-object-kind';
import { botHead, esp32Board, gitBot, kernelPhone, mobileApp, osintPhone } from './repo-object-builders-devices';
import {
  bookStudy,
  cricketKit,
  cryptoCoin,
  documentSheet,
  gamePad,
  seatMatrix,
  securityLock,
  travelGlobe,
  waterSystem,
  weatherSky,
} from './repo-object-builders-domain';
import {
  aiCore,
  analyticsBars,
  browserWindow,
  cliTerminal,
  databaseStack,
  reactAtom,
  serverRack,
} from './repo-object-builders-software';
import {
  genericPrism,
  langCodePrism,
  langHtmlShield,
  langJsBadge,
  langPythonRibbons,
  langTsBadge,
} from './repo-object-builders-lang';

export const OBJECT_BUILDERS: Record<ObjectKind, ObjectBuilder> = {
  esp32_board: esp32Board,
  kernel_phone: kernelPhone,
  mobile_app: mobileApp,
  osint_phone: osintPhone,
  bot_head: botHead,
  git_bot: gitBot,
  cricket_kit: cricketKit,
  crypto_coin: cryptoCoin,
  travel_globe: travelGlobe,
  water_system: waterSystem,
  weather_sky: weatherSky,
  book_study: bookStudy,
  document_sheet: documentSheet,
  game_pad: gamePad,
  seat_matrix: seatMatrix,
  security_lock: securityLock,
  ai_core: aiCore,
  database_stack: databaseStack,
  analytics_bars: analyticsBars,
  react_atom: reactAtom,
  server_rack: serverRack,
  browser_window: browserWindow,
  cli_terminal: cliTerminal,
  lang_ts_badge: langTsBadge,
  lang_js_badge: langJsBadge,
  lang_python_ribbons: langPythonRibbons,
  lang_html_shield: langHtmlShield,
  lang_code_prism: langCodePrism,
  generic_prism: genericPrism,
};

/**
 * Builds a kind, falling back to the generic prism if a builder throws (a real code bug, so it is
 * logged loudly). A throwing builder loses the reference to whatever it had allocated, so that
 * partial subtree is not disposed — it is ordinary JS garbage, never uploaded to the GPU.
 */
export function buildObject(kind: ObjectKind, ctx: BuildContext): { built: BuiltObject; kind: ObjectKind } | null {
  try {
    return { built: OBJECT_BUILDERS[kind](ctx), kind };
  } catch (error) {
    console.error(`3D object builder failed for kind "${kind}"`, error);
  }
  if (kind === FALLBACK_KIND) return null;
  try {
    return { built: OBJECT_BUILDERS[FALLBACK_KIND](ctx), kind: FALLBACK_KIND };
  } catch (error) {
    console.error('3D object fallback builder failed', error);
    return null;
  }
}
