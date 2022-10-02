// This does not have idempotence. It expects messages to be sent by agents in order.
const create = () => ({})

const has = (versionSet, agentId, seq) => versionSet[agentId]?.crdts[seq] !== undefined

const hasRemoved = (versionSet, agentId, seq) =>
  versionSet[agentId]?.crdts[seq] === undefined && seq <= (versionSet[agentId]?.latestSeq ?? -1)

const set = (versionSet, agentId, seq) => {
  if (versionSet[agentId] !== undefined) {
    if (seq <= versionSet[agentId].latestSeq) {
      return false
    }

    versionSet[agentId].latestSeq = seq
    versionSet[agentId].crdts[seq] = true

    return true
  }

  versionSet[agentId] = {
    latestSeq: seq,
    crdts: {
      [seq]: true,
    },
  }

  return true
}

const remove = (versionSet, agentId, seq) => {
  if (versionSet[agentId] !== undefined) {
    if (seq <= versionSet[agentId].latestSeq && versionSet[agentId].crdts[seq] === undefined) {
      return false
    }

    versionSet[agentId].latestSeq = seq
    delete versionSet[agentId].crdts[seq]

    return true
  }

  versionSet[agentId] = {
    latestSeq: seq,
    crdts: {},
  }

  return true
}

export default {
  create,
  has,
  hasRemoved,
  set,
  remove,
}
