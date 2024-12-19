// biome-ignore lint/style/useImportType: Devvit is a functional dependency of JSX.
import {Devvit} from '@devvit/public-api'
import type {JSONValue} from '@devvit/public-api'
import type {DevvitMessage, WebViewMessage} from '../../shared/types/message.js'
import {paletteGreen} from '../../shared/types/palette.js'
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

  async function onMsg(msg: WebViewMessage): Promise<void> {
    if (debug)
      console.log(`${ctx.userId} app received msg=${JSON.stringify(msg)}`)

    switch (msg.type) {
      case 'GameOver':
        setMatch(prev => {
          if (!prev) throw Error('no match')
          return {...prev, score: msg.score}
        })
        if (!match) throw Error('no match')
        await redisMatchUpdate(ctx.redis, {...match, score: msg.score})
        break

      case 'Loaded':
        {
          const score = match?.score ?? null
          if (score != null) {
            await submitNewPost(ctx, true)
            return
          }

          let nonnullPlayer = player
          if (!nonnullPlayer) {
            const user = await ctx.reddit.getCurrentUser()
            nonnullPlayer = await redisPlayerCreate(ctx.redis, {
              name: user?.username ?? anonUsername,
              snoovatarURL: (await user?.getSnoovatarUrl()) ?? anonSnoovatarURL,
              t2
            })
            setPlayer(player)
          }
          if (!postRecord) throw Error('no post record')
          const newMatch = await redisMatchCreate(
            ctx.redis,
            nonnullPlayer,
            postRecord
          )
          setMatch(newMatch)

          ctx.ui.webView.postMessage<DevvitMessage>('web-view', {
            debug,
            matchSetNum: postRecord.matchSetNum,
            p1: nonnullPlayer,
            postMatchCnt,
            score: score ?? 0, // https://reddit.atlassian.net/browse/DXC-1013
            newGame: score == null, // https://reddit.atlassian.net/browse/DXC-1013
            scoreboard,
            seed: postRecord.seed,
            type: 'Init'
          })
        }
        break

      case 'NewGame':
        await submitNewPost(ctx, true)
        break

      default:
        msg satisfies never
        break
    }
  }

  const [launch, setLaunch] = useState2(false)

  if (!launch)
    return (
      <vstack
        width='100%'
        height='100%'
        alignment='top center'
        backgroundColor={paletteGreen}
        gap='large'
        padding='medium'
      >
        <vstack width='100%' alignment='center' gap='none'>
          <image
            url='logo.png'
            imageWidth='621px'
            imageHeight='167.5px'
            width='100%'
            resizeMode='fit'
          />
          <text size='xlarge'>pick up sticks from top to bottom</text>
        </vstack>
        <button
          appearance='primary'
          size='large'
          minWidth='128px'
          icon='play-fill'
          onPress={() => setLaunch(true)}
        >
          {match?.score == null ? 'play' : 'new game'}
        </button>
      </vstack>
    )

  return (
    <webview
      id='web-view'
      grow
      onMessage={onMsg as (msg: JSONValue) => Promise<void>}
      url='index.html'
    />
  )
}
