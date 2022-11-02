import { typeDefs } from './crdt-type.js'
import {
  applyOp,
  createOp,
  getValueAtPath,
  deepCopy
} from './tiny-merge.js'

class Kernal {
  collections = {}
  versions = {}
  latestSeq = -1

  constructor (onOps) {
    this.onOps = onOps

    Object.keys(typeDefs).forEach((type) => {
      this.versions[type] = {}
      this.collections[type] = {}
    })
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
      const { type, version } = op

      this.latestSeq = Math.max(version[0], this.latestSeq)

      if (this.versions[type] === undefined) {
        continue
      }

      if (applyOp(op, this.versions[type], this.collections[type])) {
        filteredOps.push(op)
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
      const typeDef = typeDefs[type]

      for (let j = 0; j < ids.length; j++) {
        const id = ids[j]
        const document = collection[id]

        for (let fieldIndex in this.versions[type][id]) {
          const path = typeDef.paths[fieldIndex]
          const pathString = `/${path.join('.')}`
          const value = deepCopy(getValueAtPath(document, path))

          ops.push(
            createOp(
              this.versions[type],
              type,
              id,
              pathString,
              this.versions[type][id][fieldIndex],
              value,
            )
          )
        }
      }
    }

    return ops
  }
}

export default Kernal
