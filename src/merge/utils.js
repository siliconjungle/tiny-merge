export const createOp = {
  set: (id, version, value) => ({
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
