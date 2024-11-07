// biome-ignore lint/style/useImportType: Devvit is a functional dependency of JSX.
import {Devvit} from '@devvit/public-api'
import {type JSONObject, useState} from '@devvit/public-api'
import {
  AppMessageQueue,
  type WebViewMessage
} from '../../shared/types/message.js'
import {T2, T3, anonSnoovatarURL, anonUsername} from '../../shared/types/tid.js'
import {submitNewPost} from '../utils/post.js'
import {
  type MatchRecord,
  type PlayerRecord,
  type PostRecord,
  redisMatchCreate,
  redisMatchQuery,
  redisMatchUpdate,
  redisPlayerCreate,
  redisPlayerQuery,
  redisPostQuery
} from '../utils/redis.js'

export function App(ctx: Devvit.Context): JSX.Element {
  if (!ctx.postId) throw Error('no post ID')
  if (!ctx.userId) throw Error('no user ID')
  const debug = 'fiddlesticks' in ctx.debug
  const t2 = T2(ctx.userId) // hack: this should be a T2 falling back to t2_0.
  const t3 = T3(ctx.postId)
  const [match, setMatch] = useState<MatchRecord | null>(
    async () => (await redisMatchQuery(ctx.redis, `${t3}_${t2}`)) ?? null
  )
  const [postRecord] = useState<PostRecord | null>(
    async () => (await redisPostQuery(ctx.redis, t3)) ?? null
  )
  if (!postRecord) throw Error('no post record')
  const [player, setPlayer] = useState<PlayerRecord | null>(
    async () => (await redisPlayerQuery(ctx.redis, t2)) ?? null
  )

  const [[username, snoovatarURL]] = useState<[string, string]>(async () => {
    const user = await ctx.reddit.getCurrentUser()
    const url = await user?.getSnoovatarUrl()
    return [user?.username ?? anonUsername, url ?? anonSnoovatarURL]
  })

  const [msgQueue, setMsgQueue] = useState<AppMessageQueue>(
    AppMessageQueue({
      debug,
      matchSetNum: postRecord.matchSetNum,
      p1: {name: username, snoovatarURL, t2},
      score: match?.score ?? null,
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
        await submitNewPost(ctx)
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
