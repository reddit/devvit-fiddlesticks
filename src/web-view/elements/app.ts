import {type TemplateResult, html, render} from 'lit-html'
import './game-over-screen.js'
import './play-screen.js'
import './title-screen.js'
import type {
  AppMessageQueue,
  NoIDWebViewMessage
} from '../../shared/types/message.js'
import {Random} from '../../shared/types/random.js'
import type {Profile, Scoreboard} from '../../shared/types/serial.js'
import {anonSnoovatarURL, anonUsername, noT2} from '../../shared/types/tid.js'
import type {UTCMillis} from '../../shared/types/time.js'
import type {Audio} from '../types/audio.js'
import {Bag} from '../types/bag.js'
import {styles} from './css.js'

declare global {
  interface HTMLElementTagNameMap {
    'app-el': App
  }
}

export class App extends HTMLElement {
  static #styles: CSSStyleSheet = new CSSStyleSheet()
  static {
    this.#styles.replace(`
      ${styles}
      :host {
display: flex;
width: 100%;
      height: 100%;
        user-select: none;

        }
      `)
  }

  // player clicks new game to create new post.
  // player visits new post and has no record so they can click play; don't care
  // who author is.
  // player clicks play to create new match.
  // player game overs and updates play record (or not); either way game cannot
  // be replayed.

  // readonly audio: Audio = Audio()
  #bag: Bag | undefined
  #debug: boolean = false
  #matchSetNum: number = 0
  #msgID: number = 0
  #p1: Profile = {name: anonUsername, snoovatarURL: anonSnoovatarURL, t2: noT2}
  #rnd: Random | undefined
  #score: number = 0
  #scoreboard: Scoreboard = {scores: []}
  #state: 'Loading' | 'Playable' | 'Playing' | 'Unplayable' = 'Loading'

  constructor() {
    super()

    this.attachShadow({mode: 'open'})
    this.shadowRoot!.adoptedStyleSheets.push(App.#styles)
  }

  connectedCallback(): void {
    addEventListener('message', this._onMsg)
    this.render()
  }

  disconnectedCallback(): void {
    removeEventListener('message', this._onMsg)
  }

  #onGameOver(ev: CustomEvent<UTCMillis>): void {
    this.#score = ev.detail
    this.#state = 'Unplayable'
    this.#postMessage({type: 'GameOver', score: this.#score})
    this.render()
  }

  #onNewGame(): void {
    this.#state = 'Loading'
    this.#postMessage({type: 'NewGame'})
    // to-do: loading anim here.
    this.render()
  }

  #onPlay(): void {
    this.#state = 'Playing'
    // this.#started = utcMillisNow()
    this.#postMessage({type: 'Play'})
    this.render()
  }

  #onPoint(ev: CustomEvent<number>): void {
    this.#score += ev.detail
    this.render()
  }

  render(): void {
    switch (this.#state) {
      case 'Loading':
      case 'Playable':
        this.#render(
          html`<title-screen
          .loaded=${this.#state === 'Playable'}
          .matchSetNum=${this.#matchSetNum}
          @play='${this.#onPlay}'
        ></title-screen>`
        )
        break
      case 'Playing':
        this.#render(
          html`<play-screen .bag=${this.#bag} .score=${this.#score} @game-over=${this.#onGameOver} @point=${this.#onPoint}></play-screen>`
        )
        break
      case 'Unplayable':
        this.#render(
          html`<game-over-screen .matchSetNum=${this.#matchSetNum} .p1=${this.#p1} .score=${this.#score} .scoreboard=${this.#scoreboard} @new-game=${this.#onNewGame}></game-over-screen>`
        )
        break
      default:
        this.#state satisfies never
    }
  }

  _onMsg = (
    ev: MessageEvent<
      {type: 'stateUpdate'; data: AppMessageQueue} | {type: undefined}
    >
  ): void => {
    if (ev.data.type !== 'stateUpdate') return // hack: filter unknown messages.

    for (const msg of ev.data.data.q) {
      // hack: filter repeat messages.
      if (msg.id <= this.#msgID) continue
      this.#msgID = msg.id

      if (this.#debug || msg.debug)
        console.log(`iframe received msg=${JSON.stringify(msg)}`)

      switch (msg.type) {
        case 'Init':
          this.#rnd = new Random(msg.seed)
          this.#bag = Bag(this.#rnd)
          this.#debug = msg.debug
          this.#matchSetNum = msg.matchSetNum
          this.#p1.t2 = msg.p1.t2
          this.#p1.name = msg.p1.name
          this.#p1.snoovatarURL = msg.p1.snoovatarURL
          this.#score = msg.score ?? 0
          this.#scoreboard = msg.scoreboard
          this.#state = msg.score == null ? 'Playable' : 'Unplayable'
          this.render()
          this.#postMessage({type: 'Init'})
          break

        default:
          msg.type satisfies never
      }
    }
  }

  #postMessage(msg: NoIDWebViewMessage): void {
    parent.postMessage({...msg, id: this.#msgID}, document.referrer)
  }

  #render(template: TemplateResult): void {
    render(template, this.shadowRoot!, {host: this})
  }
}

customElements.define('app-el', App)
