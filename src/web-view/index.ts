import type {DevvitMessage} from '../shared/types/message.js'
import {randomEndSeed} from '../shared/types/random.js'
import './elements/app.js'

document
  .querySelector('body')
  ?.addEventListener('contextmenu', ev => ev.preventDefault())
document
  .querySelector('body')
  ?.addEventListener('click', ev => ev.preventDefault())
document
  .querySelector('body')
  ?.addEventListener('pointerdown', ev => ev.preventDefault())

const noBlocks = location.port === '1234'
const app = document.querySelector('app-el')

if (noBlocks) {
  const delay = Math.random() * 1_000
  const seed = Date.now() % randomEndSeed
  // const seed = 119016656
  // const seed = 121348560
  // const seed = 125477185
  // const seed = 133689028
  // const seed = 169064946
  console.log(`delay=${delay} seed=${seed}`)
  setTimeout(
    () =>
      app!._onMsg(
        new MessageEvent<{
          type?: 'devvit-message'
          data: {message: DevvitMessage}
        }>('message', {
          data: {
            type: 'devvit-message',
            data: {
              message: {
                debug: true,
                matchSetNum: 24,
                p1: {
                  name: 'likeoid',
                  snoovatarURL:
                    'https://i.redd.it/snoovatar/avatars/d87d7eb2-f063-424a-8e30-f02e3347ef0e.png',
                  t2: 't2_reyi3nllt'
                },
                postMatchCnt: 456,
                score: null,
                scoreboard: {
                  scores: [
                    {
                      player: {
                        name: 'ChatGPTTookMyJob',
                        snoovatarURL:
                          'https://www.redditstatic.com/shreddit/assets/thinking-snoo.png',
                        t2: 't2_vw5x123d'
                      },
                      score: 52
                    },
                    {
                      player: {
                        name: 'FlyingLaserTurtle',
                        snoovatarURL:
                          'https://i.redd.it/snoovatar/avatars/84cd9efa-8cef-4bf1-bfb0-f774c4295a8f.png',
                        t2: 't2_t1mxkn9d'
                      },
                      score: 45
                    },
                    {
                      player: {
                        name: 'neuralspikes',
                        snoovatarURL:
                          'https://i.redd.it/snoovatar/avatars/a8d67e91-64a2-48ed-98b1-85bdd9d61d13.png',
                        t2: 't2_uxu53cio'
                      },
                      score: 29
                    },
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
                    },
                    {
                      player: {
                        name: 'cedaraspen',
                        snoovatarURL:
                          'https://i.redd.it/snoovatar/avatars/nftv2_bmZ0X2VpcDE1NToxMzdfNjIyZDhmZWE0NjAzYmE5ZWRhZjEwODRiNDA3MDUyZDhiMGE5YmVkN18yOTI4NDYx_rare_424c56f3-a85d-43c2-a088-6384955555a1.png',
                        t2: 't2_mdn67zkp'
                      },
                      score: 10
                    },
                    {
                      player: {
                        name: 'Oppdager',
                        snoovatarURL:
                          'https://i.redd.it/snoovatar/avatars/985f6cf8-1304-4dbf-8569-0a93ba7021ef.png',
                        t2: 't2_7u315kgs'
                      },
                      score: 3
                    },
                    {
                      player: {
                        name: 'Minimum_Solid7428',
                        snoovatarURL:
                          'https://www.redditstatic.com/shreddit/assets/thinking-snoo.png',
                        t2: 't2_1bgenlvxgq'
                      },
                      score: 3
                    },
                    {
                      player: {
                        name: 'youngluck',
                        snoovatarURL:
                          'https://i.redd.it/snoovatar/avatars/35b99d7e-7935-42d6-9281-7a8f5bd6d093.png',
                        t2: 't2_3kh50'
                      },
                      score: -1
                    }
                  ]
                },
                seed,
                type: 'Init'
              }
            }
          }
        })
      ),
    delay
  )
}
