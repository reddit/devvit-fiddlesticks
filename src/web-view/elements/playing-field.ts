import {html, render} from 'lit-html'
import {repeat} from 'lit-html/directives/repeat.js'
import {type Audio, beep} from '../types/audio.js'
import {type Bag, bagPick, bagPoint} from '../types/bag.js'
import {Bubble} from '../utils/bubble.js'
import {css, styles} from './css.js'

declare global {
  interface HTMLElementTagNameMap {
    'playing-field': PlayingField
  }
  interface HTMLElementEventMap {
    'game-over': CustomEvent<number>
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
        cursor: pointer;
      }

      #box {
        position: relative;
        width: 100%;
        height: auto;
        aspect-ratio: 1 / 1;
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

      .club-1W {filter: hue-rotate(0deg);}
      .club-3W {filter: hue-rotate(25deg);}
      .club-5W {filter: hue-rotate(50deg);}
      .club-3I {filter: hue-rotate(75deg);}
      .club-4I {filter: hue-rotate(100deg);}
      .club-5I {filter: hue-rotate(125deg);}
      .club-6I {filter: hue-rotate(150deg);}
      .club-7I {filter: hue-rotate(175deg);}
      .club-8I {filter: hue-rotate(200deg);}
      .club-9I {filter: hue-rotate(225deg);}
      .club-LW {filter: hue-rotate(250deg);}
      .club-Putter {filter: hue-rotate(275deg);}
      .club-PW {filter: hue-rotate(300deg);}
      .club-SW {filter: hue-rotate(325deg);}
    `)
  }

  audio: Audio | undefined
  #bag: Bag | undefined
  #box: HTMLElement | undefined
  #misses: number = 0
  #score: number = 0

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.shadowRoot!.adoptedStyleSheets.push(PlayingField.#styles)
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
    this.#render()
  }

  #onClick = (ev: MouseEvent) => {
    ev.preventDefault()
    ev.stopImmediatePropagation()
    ev.stopPropagation()
    if (!this.#bag || !this.#box) return
    const rect = this.#box.getBoundingClientRect()
    const x = (ev.clientX - rect.x) / this.#box.clientWidth
    const y = (ev.clientY - rect.y) / this.#box.clientHeight
    const club = bagPoint(this.#bag, {x, y})
    if (!club) return
    const point = bagPick(this.#bag, club)
    this.dispatchEvent(Bubble('point', point))
    if (this.audio?.ctx.state !== 'running') void this.audio?.ctx.resume() // don't await; this can hang.

    if (point < 0) {
      this.#misses++
      if (this.audio?.ctx.state === 'running')
        beep(this.audio.ctx, 'square', 400, 300, 0.5)
    } else if (this.audio?.ctx.state === 'running')
      beep(this.audio.ctx, 'sine', 400, 900, 0.5)
    if (this.#misses >= 3 || !this.#bag.missing.length)
      this.dispatchEvent(Bubble('game-over', this.#score))
  }

  #render() {
    this.#box ??= this.shadowRoot?.getElementById('box') ?? undefined
    const clubs = repeat(
      [...(this.#bag?.missing ?? [])].reverse(),
      (club, i) =>
        html`
          <img
            alt='i=${this.#bag!.missing.length - 1 - i} x=${club.x} y=${club.y}'
            style='
              left: ${club.x * 100}%;
              top: ${club.y * 100}%;
              transform: translate(-50%, -50%) rotate(${club.rot}rad);
            '
            class='club-${club.type}'
            src=assets/stick.webp
          >`
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
