// biome-ignore lint/style/useImportType: Devvit is a functional dependency of JSX.
import {Devvit} from '@devvit/public-api'
import type {JSONObject} from '@devvit/public-api'
import {
  AppMessageQueue,
  type WebViewMessage
} from '../../shared/types/message.js'
import type {Score} from '../../shared/types/serial.js'
import {T2, T3, anonSnoovatarURL, anonUsername} from '../../shared/types/tid.js'
import {submitNewPost} from '../utils/post.js'
import {
  T3T2,
  redisMatchCreate,
  redisMatchQuery,
  redisMatchUpdate,
  redisPlayerCreate,
  redisPlayerQuery,
  redisPostLeaderboardQuery,
  redisPostMatchCountQuery,
  redisPostQuery
} from '../utils/redis.js'
import {useState2} from '../utils/use-state2.js'

export function App(ctx: Devvit.Context): JSX.Element {
  if (!ctx.postId) throw Error('no post ID')
  if (!ctx.userId) throw Error('no user ID')
  const t2 = T2(ctx.userId) // hack: these should be T2/3 or T2/3|undefined.
  const t3 = T3(ctx.postId)
  const debug = 'fiddlesticks' in ctx.debug
  const [match, setMatch] = useState2(() =>
    redisMatchQuery(ctx.redis, T3T2(t3, t2))
  )
  const [postRecord] = useState2(() => redisPostQuery(ctx.redis, t3))
  if (!postRecord) throw Error('no post record')
  const [player, setPlayer] = useState2(() => redisPlayerQuery(ctx.redis, t2))

  const [postMatchCnt] = useState2(() =>
    redisPostMatchCountQuery(ctx.redis, t3)
  )
  const [[username, snoovatarURL]] = useState2<[string, string]>(async () => {
    const user = await ctx.reddit.getCurrentUser()
    const url = await user?.getSnoovatarUrl()
    return [user?.username ?? anonUsername, url ?? anonSnoovatarURL]
  })

  const [scoreboard] = useState2(async () => {
    const scores: Score[] = []
    for await (const score of redisPostLeaderboardQuery(ctx.redis, t3)) {
      scores.push({
        player: {
          name: score.player.name,
          snoovatarURL: score.player.snoovatarURL,
          t2: score.player.t2
        },
        score: score.match.score
      })
      if (scores.length >= 10) break
    }
    return {scores}
  })

  const [msgQueue, setMsgQueue] = useState2(
    AppMessageQueue({
      debug,
      matchSetNum: postRecord.matchSetNum,
      p1: {name: username, snoovatarURL, t2},
      postMatchCnt,
      score: match?.score ?? null,
      scoreboard,
      seed: postRecord.seed,
      type: 'Init'
    })
  )

  // function queueMsg(msg: Readonly<NoIDAppMessage>): void {
  //   setMsgQueue(prev => ({
  //     id: prev.id + 1,
  //     q: [...prev.q, {...msg, id: prev.id + 1}]
  //   }))
  // }

  function drainQueue(id: number): void {
    setMsgQueue(prev => ({id: prev.id, q: prev.q.filter(msg => msg.id > id)}))
  }

  async function onMsg(msg: WebViewMessage): Promise<void> {
    if (debug)
      console.log(`${username} app received msg=${JSON.stringify(msg)}`)
    drainQueue(msg.id)

    switch (msg.type) {
      case 'Init':
        break

      case 'GameOver':
        setMatch(prev => {
          if (!prev) throw Error('no match')
          return {...prev, score: msg.score}
        })
        if (!match) throw Error('no match')
        await redisMatchUpdate(ctx.redis, {...match, score: msg.score})
        break

      case 'NewGame':
        await submitNewPost(ctx, true)
        break

      case 'Play':
        if (match) throw Error('match exists')
        {
          let nonnullPlayer = player
          if (!nonnullPlayer) {
            nonnullPlayer = await redisPlayerCreate(ctx.redis, {
              name: username,
              snoovatarURL,
              t2
            })
            setPlayer(player)
          }
          if (!postRecord) throw Error('no post record')
          const match = await redisMatchCreate(
            ctx.redis,
            nonnullPlayer,
            postRecord
          )
          setMatch(match)
        }
        break

      default:
        msg satisfies never
        break
    }
  }

  return (
    <webview
      grow
      onMessage={onMsg as (msg: JSONObject) => Promise<void>}
      state={msgQueue}
      url='index.html'
    />
  )
}
