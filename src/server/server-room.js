import WebSocket from 'ws'
import Kernal from '../merge/kernal'
import { createMessage } from '../merge/utils'

export class ServerRoom {
  constructor(slug) {
    this.clients = new Map()
    this.kernal = new Kernal(this.handleOps)
    this.slug = slug
  }

  handleConnection = (client) => {
    this.addClient(client)
    return this
  }

  handleMessage = async (client, message) => {
    const { kernal } = this

    switch (message.type) {
      case 'connect': {
        const { ops } = message
        kernal.applyOps(ops, 'remote')
        const snapshotOps = kernal.getSnapshotOps(this.slug)
        this.sendMessage(
          client,
          createMessage.connect(snapshotOps)
        )
        break
      }
      case 'patch': {
        const { ops } = message
        kernal.applyOps(ops, 'remote')
        break
      }
    }

    return this
  }

  handleOps = (ops, source) => {
    if (source === 'remote') {
      this.broadcastMessage(
        createMessage.patch(ops),
      )
    }

    return this
  }

  handleClose = (client) => {
    this.removeClient(client)
    return this
  }

  addClient(client) {
    this.clients.set(client.id, client)

    return client
  }

  removeClient(client) {
    if (!this.clients.has(client.id)) {
      return
    }

    this.clients.delete(client.id)

    return client
  }

  getClientById(id) {
    return this.clients.get(id)
  }

  sendMessage(client, message) {
    client.ws.send(JSON.stringify(message))
    return this
  }

  broadcastMessage(message) {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message))
      }
    })
    return this
  }

  broadcastMessageExcluding(message, clientId) {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN && client.id !== clientId) {
        client.ws.send(JSON.stringify(message))
      }
    })
    return this
  }
}
