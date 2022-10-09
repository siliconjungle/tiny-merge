import WebSocket from 'ws'
import Kernal from '../merge/kernal'
import { createMessage } from '../merge/messages'
import { getSnapshot, setSnapshot } from './database'

export class ServerRoom {
  constructor(slug) {
    this.clients = new Map()
    this.kernal = new Kernal(this.handleOps)
    this.slug = slug
    getSnapshot(slug).then((snapshot) => {
      if (snapshot.length > 0) {
        this.kernal.applyOps(snapshot, 'database')
      }
    })
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
    if (source === 'local' || source === 'remote') {
      // We don't wait for this to happen.
      setSnapshot(this.slug, this.kernal.getSnapshotOps())
    }

    if (source === 'remote' || source === 'database') {
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
