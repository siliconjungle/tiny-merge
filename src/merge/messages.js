export const createOp = {
  set: (type, id, version, value) => ({
    type,
    id,
    version,
    value,
  }),
}

export const createMessage = {
  connect: (agentId, ops) => ({
    type: 'connect',
    agentId,
    ops,
  }),
  patch: (ops) => ({
    type: 'patch',
    ops,
  }),
  connected: (agentId) => ({
    type: 'connected',
    agentId,
  }),
  disconnected: (agentId) => ({
    type: 'disconnected',
    agentId,
  })
}
