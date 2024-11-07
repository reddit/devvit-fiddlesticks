import {describe, expect, it, test} from 'vitest'
import {type RBox, rboxHits, xyAngleBetween, xyDot, xyMagnitude} from './2d.js'

describe('xyDot()', () => {
  test('v · v', () => {
    expect(
      xyDot(
        {x: -0.6836781075757513, y: 0.7297836975581459},
        {x: -0.6836781075757514, y: 0.7297836975581458}
      )
    ).toBe(1)
  })
})

describe('xyMagnitude()', () => {
  test('unit vector', () => {
    expect(
      xyMagnitude({x: -0.6836781075757513, y: 0.7297836975581459})
    ).toBeCloseTo(1)
  })
})

describe('xyAngleBetween()', () => {
  test('same vector', () => {
    const v = {x: -0.6836781075757513, y: 0.7297836975581459}
    expect(xyAngleBetween(v, v)).toBe(0)
  })

  test('zero and zero', () => {
    expect(xyAngleBetween({x: 0, y: 0}, {x: 0, y: 0})).toBe(0)
  })

  test('nonzero and zero', () => {
    expect(
      xyAngleBetween(
        {x: -0.6836781075757513, y: 0.7297836975581459},
        {x: 0, y: 0}
      )
    ).toBe(Math.PI / 2)
  })

  test('up and right', () => {
    expect(xyAngleBetween({x: 0, y: 1}, {x: 1, y: 0})).toBe(Math.PI / 2)
  })
})

describe('rboxHits()', () => {
  test('collision for overlapping boxes with no rotation', () => {
    const lhs = {x: 0, y: 0, w: 10, h: 10, rot: 0}
    const rhs = {x: 5, y: 5, w: 10, h: 10, rot: 0}
    expect(rboxHits(lhs, rhs)).toBe(true)
  })

  test('no collision for non-overlapping boxes with no rotation', () => {
    const lhs = {x: 0, y: 0, w: 10, h: 10, rot: 0}
    const rhs = {x: 20, y: 20, w: 10, h: 10, rot: 0}
    expect(rboxHits(lhs, rhs)).toBe(false)
  })

  test('collision for overlapping boxes with rotation', () => {
    const lhs = {x: 0, y: 0, w: 10, h: 10, rot: Math.PI / 4}
    const rhs = {x: 5, y: 5, w: 10, h: 10, rot: Math.PI / 4}
    expect(rboxHits(lhs, rhs)).toBe(true)
  })

  test('no collision for non-overlapping rotated boxes', () => {
    const lhs = {x: 0, y: 0, w: 10, h: 10, rot: Math.PI / 4}
    const rhs = {x: 15, y: 15, w: 10, h: 10, rot: Math.PI / 4}
    expect(rboxHits(lhs, rhs)).toBe(false)
  })

  test('collision for touching boxes (edge case)', () => {
    const lhs = {x: 0, y: 0, w: 10, h: 10, rot: 0}
    const rhs = {x: 10, y: 0, w: 10, h: 10, rot: 0}
    expect(rboxHits(lhs, rhs)).toBe(true)
  })

  test('collision for partially overlapping rotated boxes', () => {
    const lhs = {x: 0, y: 0, w: 10, h: 20, rot: Math.PI / 6}
    const rhs = {x: 5, y: 15, w: 10, h: 20, rot: -Math.PI / 6}
    expect(rboxHits(lhs, rhs)).toBe(true)
  })

  test('no collision for distant boxes with rotation', () => {
    const lhs = {x: 0, y: 0, w: 10, h: 10, rot: Math.PI / 4}
    const rhs = {x: 50, y: 50, w: 10, h: 10, rot: Math.PI / 4}
    expect(rboxHits(lhs, rhs)).toBe(false)
  })
})
