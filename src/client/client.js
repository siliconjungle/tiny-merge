import EventEmitter from 'events'

const isBrowser = typeof window !== 'undefined'

const RECONNECT_TIMEOUT = 10000

class Client extends EventEmitter {
	constructor(options) {
		super()
    this.options = options
    this.messages = []
		this.connection = isBrowser ? this.createConnection() : null
	}

	handleMessage = (event) => {
		const message = JSON.parse(event.data)
		this.emit('message', message)
	}

	handleOpen = (event) => {
		this.emit('open', event)
	}

	handleClose = (event) => {
		this.emit('close', event)
		setTimeout(this.createConnection, RECONNECT_TIMEOUT)
	}

	handleError = (event) => {
		this.emit('error', event)
	}

	createConnection = () => {
		const connection = new WebSocket(this.options.uri)
		connection.addEventListener('message', this.handleMessage)
		connection.addEventListener('open', this.handleOpen)
		connection.addEventListener('close', this.handleClose)
		connection.addEventListener('error', this.handleError)
		this.messages = []
		return connection
	}

	addMessage(message) {
		this.messages.push(message)
		this.sendMessages()
	}

	sendMessages() {
		const connection = this.connection
		if (connection?.readyState === WebSocket.OPEN) {
			this.messages.forEach((message) => {
				connection.send(JSON.stringify(message))
			})

			this.messages = []
		}
	}
}

export default Client
