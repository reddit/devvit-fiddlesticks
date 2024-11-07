import {type TemplateResult, html, render} from 'lit-html'
import type {Profile, Score, Scoreboard} from '../../shared/types/serial.js'
import {Bubble} from '../utils/bubble.js'
import {spacePx} from '../utils/metrics.js'
import {css, styles} from './css.js'

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
  width: 100%;
  height: 100%;
  flex-direction: column;
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

  #matchSetNum: number = 0
  #p1: Readonly<Profile> | undefined
  #score: number = 0
  #scoreboard: Readonly<Scoreboard> | undefined

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.shadowRoot!.adoptedStyleSheets.push(GameOverScreen.#styles)
  }

  set matchSetNum(match: number) {
    this.#matchSetNum = match
    this.#render()
  }

  set p1(p1: Readonly<Profile>) {
    this.#p1 = p1
  }

  set score(score: number) {
    this.#score = score
    this.#render()
  }

  set scoreboard(scoreboard: Readonly<Scoreboard>) {
    this.#scoreboard = scoreboard
    this.#render()
  }

  #onNewMatch(): void {
    this.dispatchEvent(Bubble('new-game', undefined))
  }

  connectedCallback(): void {
    this.#render()
  }

  #render() {
    let scoreboard
    if (this.#scoreboard && this.#p1)
      scoreboard = tweakScoreboard(this.#scoreboard, this.#p1, this.#score)
    render(
      html`
        <img alt=fiddlesticks id=logo src=assets/logo.webp width=1354 height=687>
        <button @click=${this.#onNewMatch}>new match</button>
        <img alt='golf bag' id=bag src=assets/bag.webp width=534 height=746>
        <span id=match>match #${this.#matchSetNum}</span>
        <table>
          ${scoreboard}
        </table>
      `,
      this.shadowRoot!
    )
  }
}

customElements.define('game-over-screen', GameOverScreen)

function tweakScoreboard(
  scoreboard: Readonly<Scoreboard>,
  p1: Readonly<Profile>,
  score: number
): TemplateResult[] {
  const rows = []
  let p1Present = false
  for (const score of scoreboard.scores) {
    p1Present ||= p1.t2 === score.player.t2
    rows.push(
      html`<tr><td>${score.player.name}</td><td>${score.score}</td></tr>`
    )
  }
  if (!p1Present) {
    if (score >= (scoreboard.scores[0]?.score ?? 0))
      rows.unshift(html`<tr><td>${p1.name}</td><td>${score}</td></tr>`)
    else rows.push(html`<tr><td>${p1.name}</td><td>${score}</td></tr>`)
  }
  return rows
}
