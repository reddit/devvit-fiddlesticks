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
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: ${spacePx}px;
  }

  #logo {
    max-height: 50%;
  padding-bottom: 10%;
}
#bag {
  max-height: 25%;
  margin-bottom: 12px;
}


img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
}

#match {
}

    button {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -80%);
      margin: 0;
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
        <img alt=fiddlesticks id=logo src=assets/logo.webp width=1354 height=687>
        ${this.#loaded ? html`<button @click=${this.#onPlay}>play</button>` : undefined}
        <img alt='golf bag' id=bag src=assets/bag.webp width=534 height=746>
        <span id=match>${this.#loaded ? `match #${this.#matchSetNum}` : html`&nbsp;`}</span>
      `,
      this.shadowRoot!
    )
  }
}

customElements.define('title-screen', TitleScreen)
