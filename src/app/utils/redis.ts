import type {Post, RedisClient} from '@devvit/public-api'
import {version} from '../../../package.json' // to-do: keep this consistent with devvit.yaml.
import {randomEndSeed} from '../../shared/types/random.js'
import {T2, T3} from '../../shared/types/tid.js'
import {type UTCMillis, utcMillisNow} from '../../shared/types/time.js'
import {previewVersion} from '../components/preview.js'

/** records are as independent and immutable as possible. */

// to-do: explore a postRedis() API that can be driven by the web view. how to
//        do batching efficiently to avoid many circuit breaks?

// to-do: use serial from corridor.

export type PlayerRecord = {
  /** player username. */
  name: string
  /** Redis schema version; upgrades may be batched by post. */
  redisVersion: number
  /** avatar image URL. */
  snoovatarURL: string
  t2: T2
}

/**
 * match play record for a player. recorded when a match has actually been
 * started, not when a post has been created, and updated when finished.
 */
export type MatchRecord = {
  /** creation timestamp. */
  created: UTCMillis
  /** Redis schema version; upgrades may be batched by post. */
  redisVersion: number
  /** match score. initially zero; may be negative. */
  score: number // to-do: this could have been derived from the score table.
  t2: T2
  t3: T3
}

export type PostRecord = {
  /** package.json semver. */
  appVersion: string
  author: {
    /** username. */
    name: string
    /** avatar image URL. */
    snoovatarURL: string | null
    t2: T2
  }
  /** post creation timestamp. */
  created: UTCMillis
  gameVersion: number
  /** unique post number. */
  matchSetNum: number
  /** post loading screen version. */
  previewVersion: number
  /** Redis schema version; upgrades may be batched by post. */
  redisVersion: number
  /** [1, 0x7fff_fffe]. */
  seed: number
  /** post ID. */
  t3: T3
}

/** match ID. each player is allowed one match per post. */
type T3T2 = `${T3}_${T2}`

export const redisSchemaVersion: number = 0

/**
 * if mechanics change later, we have a way to keep legacy behavior for old
 * posts or simply disable play on them.
 */
export const gameVersion: number = 0

/** player, post, and match look up and counts. */

/** PlayerRecord by user ID; player look up. */
const playerByT2Key: string = 'player_by_t2'
/** PostRecord by post ID; post look up. */
const postByT3Key: string = 'post_by_t3'
/** MatchRecord by T3T2; match look up. */
const matchByT3T2Key: string = 'match_by_t3_t2'

/** match number counter for post titles. */
const postCounterKey: string = 'post_counter'

/** post history, match history, and player leaderboard across sub. */

/** post IDs ordered by creation; post history across time. */
const t3CreatedZKey: string = 't3_created_z'
/** post IDs ordered by match count; post popularity. */
const t3MatchesZKey: string = 't3_matches_z'
/** match IDs ordered by creation; match history across time. */
const t3T2CreatedZKey: string = 't3_t2_created_z'
/** user IDs ordered by score; player leaderboard. */
const t2ScoreZKey: string = 't2_score_z'

/** per post leaderboard and match history. */

/** match IDs ordered by created; match history across time. */
const t3T2CreatedZByT3KeyTemplate: string = 't3_t2_created_z_by_{t3}'

/** match IDs ordered by score; match leaderboard. */
const t3T2ScoreZByT3KeyTemplate: string = 't3_t2_score_z_by_{t3}'

/** per player history and leaderboard. */

/** match IDs ordered by created; player match history across time. */
const t3T2CreatedZByT2KeyTemplate: string = 't3_t2_created_z_by_{t2}'

/** match IDs ordered by score; player leaderboard. */
const t3T2ScoreZByT2KeyTemplate: string = 't3_score_z_by_{t2}'

// to-do: retry redis failure.
// ask for player and post args to indicate they must be created first.
export async function redisMatchCreate(
  redis: RedisClient,
  player: Readonly<PlayerRecord>,
  post: Readonly<PostRecord>
): Promise<MatchRecord> {
  const match: MatchRecord = {
    created: utcMillisNow(),
    score: 0,
    redisVersion: redisSchemaVersion,
    t2: player.t2,
    t3: post.t3
  }
  const t3t2 = T3T2(post.t3, player.t2)
  const t3T2ScoreZByT3Key = t3T2ScoreZByT3KeyTemplate.replace('{t3}', post.t3)
  const t3T2CreatedZByT3Key = t3T2CreatedZByT3KeyTemplate.replace(
    '{t3}',
    post.t3
  )
  const t3T2CreatedZByT2Key = t3T2CreatedZByT2KeyTemplate.replace(
    '{t2}',
    player.t2
  )
  const t3T2ScoreZByT2Key = t3T2ScoreZByT2KeyTemplate.replace('{t2}', player.t2)
  // const tx = await redis.watch()
  // await tx.multi()
  await Promise.all([
    redis.hSet(matchByT3T2Key, {[t3t2]: JSON.stringify(match)}), // lookup.
    redis.zIncrBy(t3MatchesZKey, post.t3, 1),
    redis.zAdd(t3T2CreatedZKey, {member: t3t2, score: match.created}),
    redis.zAdd(t3T2ScoreZByT3Key, {member: t3t2, score: match.score}),
    redis.zAdd(t3T2CreatedZByT3Key, {member: t3t2, score: match.created}),
    redis.zAdd(t3T2CreatedZByT2Key, {member: t3t2, score: match.created}),
    redis.zAdd(t3T2ScoreZByT2Key, {member: t3t2, score: match.score})
  ])
  // await tx.exec() // to-do: error checking.
  return match
}

export async function redisMatchUpdate(
  redis: RedisClient,
  match: Readonly<MatchRecord>
): Promise<MatchRecord> {
  const t3t2 = T3T2(match.t3, match.t2)
  const t3T2ScoreZByT3Key = t3T2ScoreZByT3KeyTemplate.replace('{t3}', match.t3)
  const t3T2ScoreZByT2Key = t3T2ScoreZByT2KeyTemplate.replace('{t2}', match.t2)
  // to-do: only allow one update. this would prevent users from cheating by
  //        opening multiple tabs simultaneously.
  // const tx = await redis.watch()
  // await tx.multi()
  await Promise.all([
    redis.hSet(matchByT3T2Key, {[t3t2]: JSON.stringify(match)}), // lookup.
    redis.zIncrBy(t2ScoreZKey, match.t2, match.score),
    redis.zAdd(t3T2ScoreZByT3Key, {member: t3t2, score: match.score}),
    redis.zAdd(t3T2ScoreZByT2Key, {member: t3t2, score: match.score})
  ])
  // await tx.exec() // to-do: error checking.
  return match
}

export async function redisMatchQuery(
  redis: RedisClient,
  t3t2: T3T2
): Promise<MatchRecord | undefined> {
  const json = await redis.hGet(matchByT3T2Key, t3t2)
  if (json) return JSON.parse(json)
}

export async function redisPlayerCreate(
  redis: RedisClient,
  playerish: Readonly<Omit<PlayerRecord, 'redisVersion'>>
): Promise<PlayerRecord> {
  const player = {...playerish, redisVersion: redisSchemaVersion}
  // const tx = await redis.watch()
  // await tx.multi()
  await Promise.all([
    redis.hSet(playerByT2Key, {[player.t2]: JSON.stringify(player)}),
    redis.zIncrBy(t2ScoreZKey, player.t2, 0)
  ])
  // await tx.exec() // to-do: error checking.
  return player
}

export async function redisPlayerQuery(
  redis: RedisClient,
  t2: T2
): Promise<PlayerRecord | undefined> {
  const json = await redis.hGet(playerByT2Key, t2)
  if (json) return JSON.parse(json)
}

export async function redisPlayerMatchCountQuery(
  redis: RedisClient,
  t2: T2
): Promise<number> {
  const t3T2CreatedZByT2Key = t3T2CreatedZByT2KeyTemplate.replace('{t2}', t2)
  return redis.zCard(t3T2CreatedZByT2Key)
}

/** return player matches ordered by created. */
export async function* redisPlayerMatchesByCreatedQuery(
  redis: RedisClient,
  start: number,
  end: number,
  t2: T2
): AsyncGenerator<MatchRecord> {
  const t3T2CreatedZByT2Key = t3T2CreatedZByT2KeyTemplate.replace('{t2}', t2)

  for (const {member: t3t2} of await redis.zRange(
    t3T2CreatedZByT2Key,
    start,
    end,
    {
      by: 'score'
    }
  )) {
    const match = await redisMatchQuery(redis, t3t2 as T3T2)
    if (match) yield match
  }
}

/** return player matches ordered by score. */
export async function* redisPlayerMatchesByScoreQuery(
  redis: RedisClient,
  start: number,
  end: number,
  t2: T2
): AsyncGenerator<MatchRecord> {
  const t3T2ScoreZByT2Key = t3T2ScoreZByT2KeyTemplate.replace('{t2}', t2)

  for (const {member: t3t2} of await redis.zRange(
    t3T2ScoreZByT2Key,
    start,
    end,
    {by: 'score'}
  )) {
    const match = await redisMatchQuery(redis, t3t2 as T3T2)
    if (match) yield match
  }
}

export async function redisPostCreate(
  redis: RedisClient,
  postish: Readonly<
    Pick<Post, 'authorId' | 'authorName' | 'getAuthor' | 'createdAt' | 'id'>
  >,
  matchSetNum: number
): Promise<PostRecord> {
  if (!postish.authorId) throw Error('no author T2')
  const author = await postish.getAuthor()
  const post: PostRecord = {
    appVersion: version,
    author: {
      t2: T2(postish.authorId),
      name: postish.authorName,
      snoovatarURL: (await author?.getSnoovatarUrl()) ?? null
    },
    created: postish.createdAt.getUTCMilliseconds() as UTCMillis,
    gameVersion,
    matchSetNum,
    previewVersion,
    redisVersion: redisSchemaVersion,
    // don't use seeded random to generate the next seed since each user
    // would generate a duplicate.
    seed: Math.trunc(Math.random() * randomEndSeed),
    t3: postish.id
  }
  // const tx = await redis.watch()
  // await tx.multi()
  await Promise.all([
    redis.hSet(postByT3Key, {[post.t3]: JSON.stringify(post)}), // lookup.
    redis.zAdd(t3CreatedZKey, {member: post.t3, score: post.created}),
    redis.zAdd(t3MatchesZKey, {member: post.t3, score: 0})
  ])
  // await tx.exec() // to-do: error checking.
  return post
}

export async function redisPostQuery(
  redis: RedisClient,
  t3: T3
): Promise<PostRecord | undefined> {
  const json = await redis.hGet(postByT3Key, t3)
  if (json) return JSON.parse(json)
}

export async function* redisPostLeaderboardQuery(
  redis: RedisClient,
  t3: T3,
  start: number = Number.MIN_SAFE_INTEGER,
  end: number = Number.MAX_SAFE_INTEGER
): AsyncGenerator<{match: MatchRecord; player: PlayerRecord}> {
  const t3T2ScoreZByT3Key = t3T2ScoreZByT3KeyTemplate.replace('{t3}', t3)
  for (const {member: t3t2} of await redis.zRange(
    t3T2ScoreZByT3Key,
    start,
    end,
    {by: 'score', reverse: true}
  )) {
    // this could be hGetAll() but data could be big.
    const match = await redisMatchQuery(redis, t3t2 as T3T2)
    if (!match) continue
    const player = await redisPlayerQuery(redis, match.t2)
    if (player) yield {match, player}
  }
}

export async function redisPostMatchCountQuery(
  redis: RedisClient,
  t3: T3
): Promise<number> {
  const t3T2CreatedZByT3Key = t3T2CreatedZByT3KeyTemplate.replace('{t3}', t3)
  return redis.zCard(t3T2CreatedZByT3Key)
}

export async function* redisPostMatchesByCreationQuery(
  redis: RedisClient,
  t3: T3,
  start: number = Number.MIN_SAFE_INTEGER,
  end: number = Number.MAX_SAFE_INTEGER
): AsyncGenerator<MatchRecord> {
  const t3T2CreatedZByT3Key = t3T2CreatedZByT3KeyTemplate.replace('{t3}', t3)
  for (const {member: t3t2} of await redis.zRange(
    t3T2CreatedZByT3Key,
    start,
    end,
    {by: 'score', reverse: true}
  )) {
    const match = await redisMatchQuery(redis, t3t2 as T3T2)
    if (match) yield match
  }
}

export async function* redisSubLeaderboardQuery(
  redis: RedisClient,
  start: number = Number.MIN_SAFE_INTEGER,
  end: number = Number.MAX_SAFE_INTEGER
): AsyncGenerator<PlayerRecord> {
  for (const {member: t2} of await redis.zRange(t2ScoreZKey, start, end, {
    by: 'score',
    reverse: true
  })) {
    const player = await redisPlayerQuery(redis, T2(t2))
    if (player) yield player
  }
}

export async function* redisSubMatchesByCreatedQuery(
  redis: RedisClient,
  start: number,
  end: number
): AsyncGenerator<MatchRecord> {
  for (const {member: t3t2} of await redis.zRange(t3T2CreatedZKey, start, end, {
    by: 'score'
  })) {
    const match = await redisMatchQuery(redis, t3t2 as T3T2)
    if (match) yield match
  }
}

export async function* redisSubPostsByCreationQuery(
  redis: RedisClient,
  start: number,
  end: number
): AsyncGenerator<PostRecord> {
  for (const {member: t3} of await redis.zRange(t3CreatedZKey, start, end, {
    by: 'score'
  })) {
    const post = await redisPostQuery(redis, T3(t3))
    if (post) yield post
  }
}

/**
 * used to generate a unique match number for the title. may not actually be
 * count of posts recorded.
 */
export async function redisPostCountInc(redis: RedisClient): Promise<number> {
  return await redis.incrBy(postCounterKey, 1)
}

/** return posts ordered by match count. */
export async function* redisSubTopPostsQuery(
  redis: RedisClient,
  start: number,
  end: number
): AsyncGenerator<PostRecord & {matches: number}> {
  for (const {member: t3, score: matches} of await redis.zRange(
    t3MatchesZKey,
    start,
    end,
    {by: 'score'}
  )) {
    const post = await redisPostQuery(redis, T3(t3))
    if (post) yield {...post, matches}
  }
}

export async function redisSubPlayerCountQuery(
  redis: RedisClient
): Promise<number> {
  return await redis.zCard(playerByT2Key)
}

export function T3T2(t3: T3, t2: T2): T3T2 {
  return `${t3}_${t2}`
}
