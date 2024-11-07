import {type RBox, type WH, type XY, rboxHits} from '../../shared/types/2d.js'
import type {Random} from '../../shared/types/random.js'

export type ClubType =
  | '1W' // driver.
  | '3W'
  | '5W'
  | '3I'
  | '4I'
  | '5I'
  | '6I'
  | '7I'
  | '8I'
  | '9I'
  | 'LW' // lob wedge.
  | 'Putter'
  | 'PW' // pitching wedge.
  | 'SW' // sand wedge.

const ClubTypeSet: {readonly [club in ClubType]: true} = {
  '1W': true,
  '3W': true,
  '5W': true,
  '3I': true,
  '4I': true,
  '5I': true,
  '6I': true,
  '7I': true,
  '8I': true,
  '9I': true,
  LW: true,
  Putter: true,
  PW: true,
  SW: true
}
const img = {w: 165, h: 905}
const hitbox = {x: 114, y: 15, w: 29, h: 829}
const hRatio = img.h / img.w
const scaledHitbox = {
  x: (0.1 * hitbox.x) / img.w,
  y: (0.1 * hitbox.y * hRatio) / img.h,
  w: (0.1 * hitbox.w) / img.w,
  h: (0.1 * hitbox.h * hRatio) / img.h
}

const clubWH: {readonly [club in ClubType]: WH} = {
  '1W': {w: scaledHitbox.w, h: scaledHitbox.h},
  '3W': {w: scaledHitbox.w, h: scaledHitbox.h},
  '5W': {w: scaledHitbox.w, h: scaledHitbox.h},
  '3I': {w: scaledHitbox.w, h: scaledHitbox.h},
  '4I': {w: scaledHitbox.w, h: scaledHitbox.h},
  '5I': {w: scaledHitbox.w, h: scaledHitbox.h},
  '6I': {w: scaledHitbox.w, h: scaledHitbox.h},
  '7I': {w: scaledHitbox.w, h: scaledHitbox.h},
  '8I': {w: scaledHitbox.w, h: scaledHitbox.h},
  '9I': {w: scaledHitbox.w, h: scaledHitbox.h},
  LW: {w: scaledHitbox.w, h: scaledHitbox.h},
  Putter: {w: scaledHitbox.w, h: scaledHitbox.h},
  PW: {w: scaledHitbox.w, h: scaledHitbox.h},
  SW: {w: scaledHitbox.w, h: scaledHitbox.h}
}

export type Bag = {
  /** arranged from top to bottom. */
  missing: Club[]
  /** arranged in order picked. */
  picked: Club[]
}

export type Club = {
  /** position on a 1 x 1. */
  x: number
  y: number
  /** width and height on a 1 x 1. */
  w: number
  h: number
  /** central rotation in radians. */
  rot: number
  type: ClubType
}

export function Bag(rnd: Random): Bag {
  const types = Object.keys(ClubTypeSet) as ClubType[]
  const missing: Club[] = []
  while (types.length) {
    const type = types.splice(Math.trunc(rnd.num * types.length), 1)[0]!
    missing.push({
      x: rnd.num,
      y: rnd.num,
      w: clubWH[type].w,
      h: clubWH[type].h,
      // rot: rnd.num * 2 * Math.PI,
      rot: 0,
      type
    })
  }
  console.log(missing)
  return {missing, picked: []}
}

function scaleClub(box: Readonly<RBox>): RBox {
  return {
    x: box.x + scaledHitbox.x,
    y: box.y + scaledHitbox.y,
    w: box.w,
    h: box.h,
    rot: box.rot
  }
}

export function bagPoint(
  bag: Readonly<Bag>,
  xy: Readonly<XY>
): Club | undefined {
  console.log('point', xy)
  return bag.missing.find((club, i) => {
    const scaled = scaleClub(club)
    const hit = clubHits(scaled, xy)
    if (hit) console.log('hit', i, club, scaled)
    return hit
  })
}

export function bagPick(bag: Bag, point: Readonly<Club>): number {
  for (const [i, club] of bag.missing.entries()) {
    if (club.type === point.type) {
      bag.picked.push(bag.missing.splice(i, 1)[0]!)
      return 1
    }
    if (clubHits(scaleClub(point), scaleClub(club))) {
      console.log('blocked by', club, i)
      return -1
    }
  }
  return 0
}

function clubHits(
  lhs: Readonly<RBox>,
  rhs: Readonly<XY & Partial<WH> & {rot?: number}>
): boolean {
  // to-do: need to test club head too
  return rboxHits(lhs, {
    x: rhs.x,
    y: rhs.y,
    w: rhs.w ?? 0.0001,
    h: rhs.h ?? 0.0001,
    rot: rhs.rot ?? 0
  })
}
