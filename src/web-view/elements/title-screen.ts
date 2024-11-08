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
        width: calc(100% - ${spacePx}px * 2);
        height: calc(100% - ${spacePx}px * 2);
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        margin: ${spacePx}px;
      }

      #logo {
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

  #loaded: boolean = false
  #matchSetNum: number = 0

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

  #onPlay(): void {
    this.dispatchEvent(Bubble('play', undefined))
  }

  connectedCallback(): void {
    this.#render()
  }

  #render() {
    render(
      html`
        <img alt=fiddlesticks id=logo src=assets/logo.webp width=1242 height=373>
        ${this.#loaded ? html`<button @click=${this.#onPlay}>play</button>` : undefined}
        <span id=match>${this.#loaded ? `match #${this.#matchSetNum}` : html`&nbsp;`}</span>
      `,
      this.shadowRoot!
    )
  }
}

customElements.define('title-screen', TitleScreen)

// to-do: parallel playtest and start.
