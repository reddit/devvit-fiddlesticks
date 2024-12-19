import {css, styles} from './css.js'

declare global {
  interface HTMLElementTagNameMap {
    'title-screen': TitleScreen
  }
}

export class TitleScreen extends HTMLElement {
  static #styles: CSSStyleSheet = new CSSStyleSheet()
  static {
    this.#styles.replace(css`
      ${styles}
   `)
  }

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.shadowRoot!.adoptedStyleSheets.push(TitleScreen.#styles)
  }
}

customElements.define('title-screen', TitleScreen)
