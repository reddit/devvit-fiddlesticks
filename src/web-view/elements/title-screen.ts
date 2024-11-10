import {html, render} from 'lit-html'
import {Bubble} from '../utils/bubble.js'
import {spacePx} from '../utils/metrics.js'
import {css, styles} from './css.js'

declare global {
  interface HTMLElementTagNameMap {
    'title-screen': TitleScreen
  }
  interface HTMLElementEventMap {
    play: CustomEvent<undefined>
  }
}

export class TitleScreen extends HTMLElement {
  static #styles: CSSStyleSheet = new CSSStyleSheet()
  static {
    this.#styles.replace(css`
      ${styles}

      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        width: calc(100% - ${spacePx}px * 2);
        height: calc(100% - ${spacePx}px * 2);
        margin: ${spacePx}px;
      }

      .group {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      #logo {
        margin-top: ${spacePx * 2}px;
        max-height: 50%;
        max-width: 100%;
        width: auto;
        height: auto;
        object-fit: contain;
      }

      #match {
        font-size: 36px;
        font-weight: 800;
      }
   `)
  }

  #color: number = 0
  #loaded: boolean = false
  #matchSetNum: number = 0
  #postMatchCnt: number = 0

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.shadowRoot!.adoptedStyleSheets.push(TitleScreen.#styles)
  }

  set loaded(loaded: boolean) {
    this.#loaded = loaded
    this.#render()
  }

  set matchSetNum(match: number) {
    this.#matchSetNum = match
    this.#render()
  }

  set color(color: number) {
    this.#color = color
    this.#render()
  }

  set postMatchCnt(cnt: number) {
    this.#postMatchCnt = cnt
    this.#render()
  }

  #onPlay(): void {
    this.dispatchEvent(Bubble('play', undefined))
  }

  connectedCallback(): void {
    this.#render()
  }

  #render() {
    render(
      html`
        <div class=group>
          <img alt=fiddlesticks id=logo src=assets/logo.webp style='filter: hue-rotate(${this.#color}deg)' width=1242 height=335>
          pick up sticks from top to bottom
        </div>
        ${this.#loaded ? html`<button @click=${this.#onPlay}>play</button>` : undefined}
        <div class=group>
          <div id=match>${this.#loaded ? `match #${this.#matchSetNum}` : html`&nbsp;`}</div>
          <div>${this.#postMatchCnt ? `${this.#postMatchCnt} players` : html`&nbsp;`}</div>
        </div>
      `,
      this.shadowRoot!
    )
  }
}

customElements.define('title-screen', TitleScreen)

// to-do: parallel playtest and start.
