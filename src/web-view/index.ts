import {Game} from './game.js'

let i = 0
crypto.randomUUID ??= () => `${i}-${i}-${i}-${i}-${i++}` // hack: HTTP IP usage.

const game = await Game.new()
game.start()
