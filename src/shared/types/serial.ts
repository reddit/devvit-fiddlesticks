import type {T2} from './tid.js'

export type Profile = {
  /** player username. eg, spez. */
  name: string
  /** avatar image URL. */
  snoovatarURL: string
  /** player user ID. t2_0 for anons. */
  t2: T2
}
