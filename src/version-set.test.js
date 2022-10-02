import { describe, expect, test } from '@jest/globals'
import versionSet from './version-set'

describe('versionSet', () => {
  test('create', () => {
    const versions = versionSet.create()
    expect(versions).toEqual({})
  })
  test('has', () => {
    const versions = versionSet.create()
    const agentId = 'james'
    expect(versionSet.has(versions, agentId, 0)).toBe(false)
    versionSet.set(versions, agentId, 0)
    expect(versionSet.has(versions, agentId, 0)).toBe(true)
    expect(versionSet.has(versions, agentId, 1)).toBe(false)
  })
  test('hasRemoved', () => {
    const versions = versionSet.create()
    const agentId = 'james'
    expect(versionSet.hasRemoved(versions, agentId, 0)).toBe(false)
    versionSet.set(versions, agentId, 0)
    expect(versionSet.hasRemoved(versions, agentId, 0)).toBe(false)
    versionSet.remove(versions, agentId, 0)
    expect(versionSet.hasRemoved(versions, agentId, 0)).toBe(true)
    expect(versionSet.hasRemoved(versions, agentId, 1)).toBe(false)
  })
  test('set', () => {
    const versions = versionSet.create()
    const agentId = 'james'
    expect(versionSet.set(versions, agentId, 0)).toBe(true)
    expect(versionSet.set(versions, agentId, 0)).toBe(false)
    expect(versionSet.set(versions, agentId, 1)).toBe(true)
    expect(versionSet.set(versions, agentId, 3)).toBe(true)
    expect(versionSet.set(versions, agentId, 2)).toBe(false)
  })
})
