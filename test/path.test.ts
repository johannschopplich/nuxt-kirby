import { describe, expect, it } from 'vitest'
import { assertPathBelowBase } from '../src/runtime/path'

describe('assertPathBelowBase', () => {
  it.each([
    'http://host/x',
    '//host/x',
    '\\\\host/x',
    '\0//host/x',
    'pages\tnotes',
    'pages\nnotes',
    '../secret',
    'pages/..\\secret',
    'pages/..%2Fsecret',
    '%2E%2E/secret',
    '..;/secret',
    '..%3B/secret',
    '.. /secret',
  ])('rejects %j', (path) => {
    expect(() => assertPathBelowBase(path)).toThrow('Path must stay below the Kirby URL')
  })

  it.each([
    'pages/notes',
    './pages/notes',
  ])('accepts %j', (path) => {
    expect(() => assertPathBelowBase(path)).not.toThrow()
  })
})
