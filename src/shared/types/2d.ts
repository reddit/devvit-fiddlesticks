import {clamp, closeTo} from '../utils/math.ts'

export type RBox = XY &
  WH & {
    /** radians. */
    rot: number
  }
export type WH = {w: number; h: number}
export type XY = {x: number; y: number}

// need to test club head too

export function rboxHits(lhs: Readonly<RBox>, rhs: Readonly<RBox>): boolean {
  const rotLHS = rboxRot(lhs)
  const rotRHS = rboxRot(rhs)
  for (const axis of [...getAxes(rotLHS), ...getAxes(rotRHS)]) {
    const projLHS = project(rotLHS, axis)
    const projRHS = project(rotRHS, axis)
    if (projLHS.max < projRHS.min || projRHS.max < projLHS.min) return false
  }
  return true
}

/** rotate box around center. */
function rboxRot(box: Readonly<RBox>): XY[] {
  const {x, y, w, h, rot} = box
  const half = {w: w / 2, h: h / 2}
  return [
    xyRot({x: x - half.w, y: y - half.h}, box, rot),
    xyRot({x: x + half.w, y: y - half.h}, box, rot),
    xyRot({x: x + half.w, y: y + half.h}, box, rot),
    xyRot({x: x - half.w, y: y + half.h}, box, rot)
  ]
}

/** Projects the vertices of a rectangle onto a given axis to determine the minimum and maximum projections. */
function project(
  verts: readonly Readonly<XY>[],
  axis: Readonly<XY>
): {min: number; max: number} {
  let min = Infinity
  let max = -Infinity
  for (const vertex of verts) {
    const projection = vertex.x * axis.x + vertex.y * axis.y
    min = Math.min(min, projection)
    max = Math.max(max, projection)
  }
  return {min, max}
}

/** Gets the perpendicular axes of the edges of the rectangle for SAT. */
function getAxes(verts: Readonly<XY>[]): XY[] {
  const axes = []
  for (let i = 0; i < verts.length; i++) {
    const edge = xySub(verts[i]!, verts[(i + 1) % verts.length]!)
    axes.push({x: -edge.y, y: edge.x})
  }
  return axes
}

/** returns angle between vectors in radians [0, π]. */
export function xyAngleBetween(lhs: Readonly<XY>, rhs: Readonly<XY>): number {
  const mag0 = xyMagnitude(lhs)
  const mag1 = xyMagnitude(rhs)
  if (!mag0 && !mag1) return 0
  return Math.acos(clamp(xyDot(lhs, rhs) / (mag0 * mag1 || 1), -1, 1))
}

export function xyCloseTo(
  lhs: Readonly<XY>,
  rhs: Readonly<XY>,
  tolerance: number
): boolean {
  return closeTo(lhs.x, rhs.x, tolerance) && closeTo(lhs.y, rhs.y, tolerance)
}

export function xyDot(v0: Readonly<XY>, v1: Readonly<XY>): number {
  return v0.x * v1.x + v0.y * v1.y
}

export function xyMagnitude(v: Readonly<XY>): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

// export function xyLerp(
//   start: Readonly<XY>,
//   end: Readonly<XY>,
//   ratio: number
// ): XY {
//   return {x: lerp(start.x, end.x, ratio), y: lerp(start.y, end.y, ratio)}
// }

/** rotate point around center. */
function xyRot(xy: Readonly<XY>, origin: Readonly<XY>, rot: number): XY {
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)
  return {
    x: cos * (xy.x - origin.x) - sin * (xy.y - origin.y) + origin.x,
    y: sin * (xy.x - origin.x) + cos * (xy.y - origin.y) + origin.y
  }
}

export function xySub(lhs: Readonly<XY>, rhs: Readonly<XY>): XY {
  return {x: lhs.x - rhs.x, y: lhs.y - rhs.y}
}

export function xyTrunc(xy: Readonly<XY>): XY {
  return {x: Math.trunc(xy.x), y: Math.trunc(xy.y)}
}
