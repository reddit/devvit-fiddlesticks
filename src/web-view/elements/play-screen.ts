import {html, render} from 'lit-html'
import {type UTCMillis, utcMillisNow} from '../../shared/types/time.js'
import type {Bag} from '../types/bag.js'
import {Bubble} from '../utils/bubble.js'
import {matchMillis, spacePx} from '../utils/metrics.js'
import {css, styles} from './css.js'

import './playing-field.js'

declare global {
  interface HTMLElementTagNameMap {
    'play-screen': PlayScreen
  }
  interface HTMLElementEventMap {
    'game-over': CustomEvent<number>
  }
}

export class PlayScreen extends HTMLElement {
  static #styles: CSSStyleSheet = new CSSStyleSheet()
  static {
    this.#styles.replace(css`
      ${styles}

      :host {
        display: flex;
        width: 100%;
        height: 100%;
        margin: ${spacePx}px;
      }

      playing-field {
        position: absolute;
        top: ${spacePx};
        width: calc(100% - 2 * ${spacePx}px);
        height: calc(100% - 2 * ${spacePx}px);
      }
  `)
  }

  #bag: Bag | undefined
  #frame: number | undefined
  #score: number = 0
  #started: UTCMillis = utcMillisNow()

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.shadowRoot!.adoptedStyleSheets.push(PlayScreen.#styles)
  }

  set bag(bag: Bag | undefined) {
    this.#bag = bag
    this.#render()
  }

  set score(score: number) {
    this.#score = score
    this.#render()
  }

  connectedCallback(): void {
    this.#frame ??= requestAnimationFrame(this.#onLoop)
  }

  disconnectedCallback(): void {
    if (this.#frame != null) cancelAnimationFrame(this.#frame)
  }

  #onLoop = () => {
    if (!this.#bag) throw Error('no bag')
    const now = utcMillisNow()
    if (now - this.#started < matchMillis)
      this.#frame = requestAnimationFrame(this.#onLoop)
    else {
      let bonus = 0
      if (!this.#bag.missing.length)
        bonus += Math.max(
          0,
          Math.trunc(matchMillis - (now - this.#started) / 1_000)
        )
      this.dispatchEvent(Bubble('game-over', this.#score + bonus))
    }
    this.#render()
  }

  #render() {
    const secs = Math.max(
      0,
      Math.round((matchMillis - (utcMillisNow() - this.#started)) / 1000)
    )
    render(
      html`
        <h2>${secs}</h2>
        <playing-field .bag=${this.#bag} .score=${this.#score}></playing-field>
        <h2>${this.#score}</h2>
      `,
      this.shadowRoot!
    )
  }
}

customElements.define('play-screen', PlayScreen)
