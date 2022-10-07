import express from 'express'
import cors from 'cors'
import { Server } from './server'

const PORT = process.env.PORT || 8080

const expressServer = express()
  .get('/', cors(), async (_, res) => {
    res.json([])
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

new Server(expressServer)
