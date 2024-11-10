# [fiddlesticks](https://reddit.com/r/fiddlesticks)

[![demo](resources/screenshot.png)](resources/screenshot.png)

fiddlesticks is a competitive game of pick-up sticks.

## learnings

the team's goal through year end is to build a hit game. fiddlesticks was built in about five days from Sunday, November 3rd, 2024 to Friday, November 8th. fiddlesticks' goals were to implement the smallest game as nicely and quickly as possible.

I'm going to start doing:

- make a mock, then build the game, and continue building breadth-first. there's a narrow window of games at the intersection of [the venn diagram of games I like, games snoos like, and games I can build in a week](https://gamedeveloper.com/business/how-to-choose-what-game-to-make-next-2). fiddlesticks was intended to be a highly polished, extremely simple, game made quick but ended up going through multiple redesigns and hard failed the first two and nearly failed the third. I did a lot of design and technical upfront planning that ended up being huge investments that didn't pan out. for example, the initial version of the game was golf themed. I spent a lot of time on this design before realizing the golf clubs would have to be so unrecognizably thick to pick up on mobile. I even had an initial prototype of the game and didn't understand that. by the time I got to third redesign, my stamina and creativity had dried up. another example was spending way too much on the Redis design before making the game itself. I wanted to avoid migrations but there's a lot of stuff I didn't have time to make use of and I committed the cardinal sin of imagining what I might need. I didn't strike the balance between upfront and organic design and I didn't exercise good judgement in knowing which constraints to embrace and which to buck.
- choose carefully between DOM and canvas rendering. using both adds a lot of complexity but so does trying to make everything fit through the DOM. fiddlesticks' stick rendering is not an approach I would ever want to use. there's a lot of code that I can't reuse.
- use actual sized buttons in the mock.

I'm going to keep doing:

- shareable single player games. games with leaderboards, distinctive first screens with a strong call to action, seeded matches. all this kind of integration was time consuming but it's valuable and I think I can do this better, faster next time.
- developing with esbuild. fake messages are the way to go.
- targeting small games.
- building simple UI.
- aim for a strong design. I didn't achieve that with fiddlesticks but it's important.
- dodging other responsibilities. there was an enormously impactful PR this week that cost a lot of time and energy as well as some oncall duties and snow shoveling. the less I spend there, the more I spend here.
- think critically when planning. you don't get what you don't aim at. I want to be careful not to build something I know I don't want.

### what would make fiddlesticks fun?

probably a lot more polish, particularly in the UI, more modes and objects to pick up (for example, animals, rocks, toys, and garbage). there's probably an upper ceiling on it though.

### DOM vs Canvas

the DOM added a layer of indirection that was flexible but hard to reason about for positioning and collision detection. I don't want to ever see this code again.

#### yhtml

experimenting with [yhtml](https://github.com/dchester/yhtml) but couldn't get event listeners to work with shadow DOM.

```ts
export class AppEl extends HTMLElement {
  static #styles: CSSStyleSheet = new CSSStyleSheet()
  static {
    this.#styles.replace(`
      :host {
        background-image: url('assets/fairway.webp');
        display: flex;
        width: 100%;
      }
      title-screen {
        flex-grow: 1;
      }
    `)
  }

  #played: boolean = false

  constructor() {
    super()
    this.attachShadow({mode: 'open'})
    this.shadowRoot!.adoptedStyleSheets.push(AppEl.#styles)
  }

  connectedCallback(): void {
    this.#render()
  }

  private _onPlay(): void {
    console.log('play')
    this.#render()
  }

  #render(): void {
    this.shadowRoot!.innerHTML =
      html`<title-screen played='${this.#played}' @play=${this._onPlay}></title-screen>`
  }
}

customElements.define('app-el', AppEl)
```

when I reworked to the light DOM, event firing functioned but I hit an infinite recursion bug and I lost patience at this point as the library is only available in minified, untyped form.

```ts
export class TitleScreen extends HTMLElement {
  constructor() {
    super()
    this.style.display = 'flex'
    this.style.alignItems = 'center'
    this.style.flexDirection = 'column'
  }

  get played(): boolean {
    return this.getAttribute('played') === 'true'
  }

  set played(played: string) {
    this.setAttribute('played', played)
  }

  private _onNewGame(): void {
    this.dispatchEvent(Bubble('new-game', undefined))
  }

  private _onPlay(): void {
    this.dispatchEvent(Bubble('play', undefined))
  }

  connectedCallback(): void {
    this.#render()
  }

  #render() {
    this.innerHTML = html`
      <style>
        img {
          max-width: 100%;
          height: auto;
        }
      </style>
      <img alt='fiddlesticks' src='assets/fiddlesticks.webp'>
      ${
        this.played
          ? html`<button @click="_onNewGame">New Game</button>`
          : html`<button @click="_onPlay">Play</button>`
      }
    `
  }
}

customElements.define('title-screen', TitleScreen)
```

it also broke type-checking for event callbacks.

#### lit-html

experimenting with lit-html which is a subset of lit. had to add a css nop helper for syntax highlighting. I kind of missed the @property dectorator but at the same time I loved that all the magic and class hierarchy disappeared. I can even subclass native elements directly instead of only LitElement. I'd lean towards using it again because it was so easy to reason about but it'd probably be tough if I was collaborating with a larger team of contributors.

### Biome

I despite that the default for all biome rules is error (red squigglies). I stop in the middle of what I'm doing to address what end up being trivial stylistic and lints that are unlikely to cause a bug during development. it also doesn't format HTML or CSS template literals.

### node unit test runner with type stripping

`noEmit`, `allowImportingTsExtensions`, and project references seem totally incompatible.

```
Referenced project '/home/user/work/reddit/src/stephenoid/games/fiddlesticks/src/shared' may not disable emit.ts
```

I finally realized that I was missing `rewriteRelativeImportExtensions` which is even called out in [the 5.7 releases notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-7-rc/). I just forgot! unfortunately, I ran out of time to figure out how to use conditional exports given I just have the package.json and multiple tsconfigs. I don't think this feature is ready for use.

```
This import path is unsafe to rewrite because it resolves to another project, and the relative path between the projects' output files is not the same as the relative path between its input files.ts(2878)
```

### game editors

I looked a little into Construct, Phaser editor, and GodotJS but I'm not sure if I want to go down that road yet or not.

## the road ahead

- open-source.
- build something new, small, popular, and fun.
