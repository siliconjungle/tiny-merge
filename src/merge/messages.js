export const createOp = {
  set: (type, id, version, value) => ({
    type,
    id,
    version,
    value,
  }),
}

export const createMessage = {
  connect: (ops) => ({
    type: 'connect',
    ops,
  }),
  patch: (ops) => ({
    type: 'patch',
    ops,
  }),
}
