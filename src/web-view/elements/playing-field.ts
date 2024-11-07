import {type TemplateResult, html, render} from 'lit-html'
import {repeat} from 'lit-html/directives/repeat.js'
import {type Bag, bagPick, bagPoint} from '../types/bag.js'
import {Bubble} from '../utils/bubble.js'
import {paletteBlack} from '../utils/palette.js'
import {css, styles} from './css.js'

declare global {
  interface HTMLElementTagNameMap {
    'playing-field': PlayingField
  }
  interface HTMLElementEventMap {
    'game-over': CustomEvent<undefined>
    point: CustomEvent<number>
  }
}

// to-do: flip clubs on x too.

export class PlayingField extends HTMLElement {
  static #styles: CSSStyleSheet = new CSSStyleSheet()
  static {
    this.#styles.replace(css`
      ${styles}

      :host {
        display: flex;
        width: 100%;
        height: 100%;
        padding: 80px;
        cursor: pointer;
      }

      #box {
        position: relative;
        width: 100%;
        height: auto;
        aspect-ratio: 1 / 1;
        background: pink;
        margin: auto;
      }

      @media (min-aspect-ratio: 1/1) {
        #box {
          width: auto;
          height: 100%;
        }
      }

      img {
        position: absolute;
        width: auto;
        height: 80%;
        transform-origin: center;
        }
  `)
  }

  #bag: Bag | undefined
  #box: HTMLElement | undefined

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.shadowRoot!.adoptedStyleSheets.push(PlayingField.#styles)
  }

  set bag(bag: Bag | undefined) {
    this.#bag = bag
    this.#render()
  }

  connectedCallback(): void {
    this.#render()
  }

  #onClick = (ev: MouseEvent) => {
    if (!this.#bag || !this.#box) return
    const rect = this.#box.getBoundingClientRect()
    console.log(rect)
    const x = (ev.clientX - rect.x) / this.#box.clientWidth
    const y = (ev.clientY - rect.y) / this.#box.clientHeight
    const club = bagPoint(this.#bag, {x, y})
    if (!club) return
    const point = bagPick(this.#bag, club)
    this.dispatchEvent(Bubble('point', point))
    if (!this.#bag.missing.length)
      this.dispatchEvent(Bubble('game-over', undefined))
  }

  #render() {
    this.#box ??= this.shadowRoot?.getElementById('box') ?? undefined
    const clubs = repeat(
      [...(this.#bag?.missing ?? [])].reverse(),
      (club, i) =>
        html`
            <img
              alt='i=${this.#bag!.missing.length - 1 - i} x=${club.x} y=${club.y}'
              style="
                left: ${club.x * 100}%;
                top: ${club.y * 100}%;
                transform: translate(-50%, -50%) rotate(${club.rot}rad);
              "
              src=assets/club-9i.webp
            >`
      // translate(-50%, -50%)
    )
    render(
      html`<div id=box @click=${this.#onClick}>
        ${clubs}
      </div>
      `,
      this.shadowRoot!
    )
  }
}

customElements.define('playing-field', PlayingField)
