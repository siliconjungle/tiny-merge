import WebSocket from 'ws'
import Kernal from '../merge/kernal'
import { createMessage } from '../merge/messages'
import {
  getSnapshot,
  setSnapshot,
} from './database'

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
    switch (message.type) {
      case 'connect': {
        const { ops, agentId } = message
        client.agentId = agentId

        this.kernal.applyOps(ops, 'remote')
        const snapshotOps = this.kernal.getSnapshotOps(this.slug)
        this.sendMessage(
          client,
          createMessage.connect(agentId, snapshotOps)
        )
        // This should be compressed into a single message.
        // We are currently doing a bunch of inefficient work.
        for (const [_, innerClient] of this.clients) {
          if (innerClient.agentId) {
            this.sendMessage(
              client,
              createMessage.connected(innerClient.agentId)
            )
          }
        }
        this.broadcastMessageExcluding(createMessage.connected(agentId), client.id)
        break
      }
      case 'patch': {
        const { ops } = message
        this.kernal.applyOps(ops, 'remote')
        break
      }
    }

    return this
  }

  handleOps = (ops, source) => {
    if (source === 'local' || source === 'remote') {
      setSnapshot(this.slug, this.kernal.getSnapshotOps())
    }

    // This should not be sent to the sender.
    this.broadcastMessage(
      createMessage.patch(ops),
    )

    return this
  }

  handleClose = (client) => {
    this.removeClient(client)
    return this
  }

  addClient = (client) => {
    this.clients.set(client.id, client)

    return client
  }

  removeClient = (client) => {
    if (!this.clients.has(client.id)) {
      return
    }

    this.broadcastMessageExcluding(createMessage.disconnected(client.agentId), client.id)

    this.clients.delete(client.id)

    return client
  }

  getClientById = (id) => {
    return this.clients.get(id)
  }

  sendMessage = (client, message) => {
    client.ws.send(JSON.stringify(message))
    return this
  }

  broadcastMessage = (message) => {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message))
      }
    })
    return this
  }

  broadcastMessageExcluding = (message, clientId) => {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN && client.id !== clientId) {
        client.ws.send(JSON.stringify(message))
      }
    })
    return this
  }
}
