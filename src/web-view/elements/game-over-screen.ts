import {html, render} from 'lit-html'
import {Bubble} from '../utils/bubble.js'
import {css, styles} from './css.js'

const playtimeSeconds: number = 30

declare global {
  interface HTMLElementTagNameMap {
    'game-over-screen': GameOverScreen
  }
  interface HTMLElementEventMap {
    'new-game': CustomEvent<undefined>
  }
}

export class GameOverScreen extends HTMLElement {
  static #styles: CSSStyleSheet = new CSSStyleSheet()
  static {
    this.#styles.replace(css`
      ${styles}

      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 32px;
      }
  `)
  }

  matchSetNum: number = 0

  #time: number = playtimeSeconds

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.shadowRoot!.adoptedStyleSheets.push(GameOverScreen.#styles)
  }

  connectedCallback(): void {
    // setInterval()
    this.#render()
  }

  #render() {
    render(
      html`
        <h2>game over</h2>
      `,
      this.shadowRoot!
    )
  }
}

customElements.define('game-over-screen', GameOverScreen)
