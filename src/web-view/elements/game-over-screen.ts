import {type TemplateResult, html, render} from 'lit-html'
import type {Profile, Scoreboard} from '../../shared/types/serial.js'
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
        width: calc(100% - ${spacePx}px * 2);
        height: calc(100% - ${spacePx}px * 2);
        max-height: calc(100% - ${spacePx}px * 2);
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

      #box {
        flex-basis: auto;
        overflow-y: auto;
      }

      td {
        padding: 0 ${spacePx}px;
      }

      .snoovatar {
        max-height: 64px;
        max-width: 64px;
        width: auto;
        height: 64px;
        object-fit: contain;
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
        <img alt=fiddlesticks id=logo src=assets/logo.webp width=1242 height=335>
        <button @click=${this.#onNewMatch}>new match</button>
        <div id=box><table>${scoreboard}</table></div>
        <span id=match>match #${this.#matchSetNum}</span>
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
      // to-do: bold player
      html`<tr><td><img class=snoovatar src='${score.player.snoovatarURL}'></td><td>${score.player.name}</td><td>${score.score}</td></tr>`
    )
  }
  if (!p1Present) {
    for (let i = 0; i < scoreboard.scores.length; i++) {
      if (score >= scoreboard.scores[i]!.score) {
        rows.splice(
          i,
          0,
          html`<tr><td><img class=snoovatar src='${p1.snoovatarURL}'></td><td>${p1.name}</td><td>${score}</td></tr>`
        )
        p1Present = true
        break
      }
    }
    if (!p1Present)
      rows.push(
        html`<tr><td><img class=snoovatar src='${p1.snoovatarURL}'></td><td>${p1.name}</td><td>${score}</td></tr>`
      )
  }
  return rows
}
