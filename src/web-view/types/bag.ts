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
const imgWH: Readonly<WH> = {w: 46, h: 909}
const scaledImgWH: Readonly<WH> = {
  w: (0.8 * imgWH.w) / imgWH.h,
  h: 0.8
}
type Box = WH & XY
const hitbox: Readonly<Box> = {x: 9, y: 10, w: 28, h: 888}
const scaledHitbox: Readonly<Box> = {
  x: (0.8 * hitbox.x) / imgWH.h,
  y: 0.8 * hitbox.y,
  w: (0.8 * hitbox.w) / imgWH.h,
  h: (0.8 * hitbox.h) / imgWH.h
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
      w: scaledImgWH.w,
      h: scaledImgWH.h,
      rot: rnd.num * 2 * Math.PI,
      type
    })
  }
  console.log(missing)
  return {missing, picked: []}
}

export function bagPoint(
  bag: Readonly<Bag>,
  xy: Readonly<XY>
): Club | undefined {
  console.log('point', xy)
  return bag.missing.find((club, i) => {
    const hit = clubHits(club, xy)
    if (hit) console.log('hit', i, club)
    return hit
  })
}

function hitboxClub(box: Readonly<RBox>): RBox {
  return {
    x: box.x + scaledHitbox.x,
    y: box.y + scaledHitbox.y,
    w: scaledHitbox.w,
    h: scaledImgWH.h,
    rot: box.rot
  }
}

export function bagPick(bag: Bag, point: Readonly<Club>): number {
  const hitbox = hitboxClub(point)
  for (const [i, club] of bag.missing.entries()) {
    if (club.type === point.type) {
      bag.picked.push(bag.missing.splice(i, 1)[0]!)
      return 1
    }
    if (clubHits(hitbox, hitboxClub(club))) {
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
