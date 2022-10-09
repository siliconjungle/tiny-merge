import { createOp } from './messages'

export const shouldSet = ([seq, agentId], [seq2, agentId2]) =>
  seq2 > seq || (seq2 === seq && agentId2 > agentId)

class Kernal {
  collections = {}
  versions = {}
  latestSeq = -1

  constructor (onOps) {
    this.onOps = onOps
  }

  getIds(type) {
    return Object.keys(this.collections[type] ?? {}) ?? []
  }

  get(type, id) {
    return this.collections[type]?.[id]
  }

  applyOps(ops, source) {
    const filteredOps = []

    for (let op of ops) {
      const { type, id, version, value } = op

      this.latestSeq = Math.max(version[0], this.latestSeq)

      this.versions[type] ??= {}
      this.collections[type] ??= {}

      const currentVersion = this.versions[type][id]
      if (currentVersion === undefined || shouldSet(currentVersion, version)) {
        filteredOps.push(op)
        this.versions[type][id] = version
        this.collections[type][id] = value
      }
    }

    if (filteredOps.length > 0) {
      this.onOps(filteredOps, source)
    }
  }

  getSnapshotOps() {
    const ops = []

    const collections = Object.entries(this.collections)

    for (let i = 0; i < collections.length; i++) {
      const [type, collection] = collections[i]
      const ids = Object.keys(collection)

      for (let j = 0; j < ids.length; j++) {
        const id = ids[j]
        ops.push(
          createOp.set(
            type,
            id,
            this.versions[type][id],
            collection[id],
          )
        )
      }
    }

    return ops
  }
}

export default Kernal
