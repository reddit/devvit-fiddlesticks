import {AppMessageQueue} from '../shared/types/message.js'
import {randomEndSeed} from '../shared/types/random.js'
import {anonSnoovatarURL, anonUsername, noT2} from '../shared/types/tid.js'
import './elements/app.js'

const noApp = location.port === '1234'
const app = document.querySelector('app-el')

if (noApp) {
  const delay = Math.random() * 1_000
  // const seed = Date.now() % randomEndSeed
  // const seed = 119016656
  // const seed = 121348560
  const seed = 125477185
  console.log(`delay=${delay} seed=${seed}`)
  setTimeout(
    () =>
      app!._onMsg(
        new MessageEvent<{type: 'stateUpdate'; data: AppMessageQueue}>(
          'message',
          {
            data: {
              type: 'stateUpdate',
              data: AppMessageQueue({
                debug: true,
                matchSetNum: 123,
                p1: {
                  name: anonUsername,
                  t2: noT2,
                  snoovatarURL: anonSnoovatarURL
                },
                score: null,
                seed,
                type: 'Init'
              })
            }
          }
        )
      ),
    delay
  )
}
