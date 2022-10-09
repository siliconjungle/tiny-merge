import { WebSocketServer } from 'ws'
import { nanoid } from 'nanoid'
import { ServerRoom } from './server-room'

export class Server {
  constructor(expressServer) {
    this.wss = new WebSocketServer({ server: expressServer })
    this.rooms = new Map()
    this.sockets = new Map()

    this.wss.on('connection', (ws, req) => {
      const url = (req.url ?? '/test').substring(1)
      const client = { ws, id: nanoid(), slug: url, alive: true, data: {} }
      this.sockets.set(ws, client)

      const currentRoom = this.getRoomBySlug(req.url)
      currentRoom.handleConnection(client)

      ws.on('message', (data, isBinary) => {
        if (isBinary) {
          return
        }

        const message = JSON.parse(data.toString())

        currentRoom.handleMessage(client, message)
      })

      ws.on('close', () => {
        currentRoom.handleClose(client)
        if (currentRoom.clients.size === 0) {
          this.rooms.delete(client.slug)
        }
      })
    })
  }

  getRoomBySlug(slug) {
    const existingRoom = this.rooms.get(slug)
    if (existingRoom) {
      return existingRoom
    }
    const room = new ServerRoom(slug)
    this.rooms.set(slug, room)
    return room
  }
}
