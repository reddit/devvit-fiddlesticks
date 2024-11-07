import {AppMessageQueue} from '../shared/types/message.js'
import {randomEndSeed} from '../shared/types/random.js'
import {anonSnoovatarURL, anonUsername, noT2} from '../shared/types/tid.js'
import './elements/app.js'

const noApp = location.port === '1234'
const app = document.querySelector('app-el')

if (noApp) {
  const delay = Math.random() * 1_000
  const seed = Date.now() % randomEndSeed
  // const seed = 119016656
  // const seed = 121348560
  // const seed = 125477185
  // const seed = 133689028
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
                matchSetNum: 24,
                p1: {
                  name: 'likeoid',
                  snoovatarURL:
                    'https://i.redd.it/snoovatar/avatars/d87d7eb2-f063-424a-8e30-f02e3347ef0e.png',
                  t2: 't2_reyi3nllt'
                },
                score: null,
                scoreboard: {
                  scores: [
                    {
                      player: {
                        name: 'pizzaoid',
                        snoovatarURL:
                          'https://www.redditstatic.com/shreddit/assets/thinking-snoo.png',
                        t2: 't2_hbbuxlhe5'
                      },
                      score: 13
                    },
                    {
                      player: {
                        name: 'stephenoid',
                        snoovatarURL:
                          'https://i.redd.it/snoovatar/avatars/a67a8a09-fb44-4041-8073-22e89210961d.png',
                        t2: 't2_k6ldbjh3'
                      },
                      score: 12
                    }
                  ]
                },
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
