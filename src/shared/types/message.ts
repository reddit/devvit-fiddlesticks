import type {Profile, Scoreboard} from './serial.js'

/** a window message from the app to the web view. */
export type DevvitMessage = {
  /**
   * configure web view lifetime debug mode. this is by request in devvit
   * but that granularity doesn't make sense in the web view.
   */
  debug: boolean
  p1: Profile
  matchSetNum: number
  postMatchCnt: number
  score: number | null
  scoreboard: Scoreboard
  seed: number
  readonly type: 'Init'
}

/** a window message from the web view to the app. */
export type WebViewMessage =
  | {score: number; readonly type: 'GameOver'}
  | {readonly type: 'NewGame'}
