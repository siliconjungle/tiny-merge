import EventEmitter from 'events'
import Client from './Client'
import Kernal from '../merge/kernal'
import { createMessage } from './merge'

export class ClientRoom extends EventEmitter {
	constructor(uri, slug) {
		super()
		this.client = new Client({ uri: uri + '/' + slug })
		this.client.addListener('open', this.handleOpen)
		this.client.addListener('close', this.handleClose)
		this.client.addListener('error', this.handleError)
		this.client.addListener('message', this.handleMessage)
		this.kernal = new Kernal(this.handleOps)
	}

	sendMessage(message) {
		this.client.addMessage(message)
	}

	handleOpen = () => {
		const ops = this.kernal.getSnapshotOps()
		this.client.addMessage(createMessage.connect(ops))
	}

	handleClose = () => {}
	handleError = () => {}
	handlePatch = () => {}

	handleOps = (ops, source) => {
		if (source === 'remote') {
			this.emit('apply-operations-remote', ops)
		} else if (source === 'local') {
			this.client.addMessage(createMessage.patch(ops))
		}
	}

	handleMessage = (message) => {
		switch (message.type) {
			case 'connect': {
				this.kernal.applyOps(message.ops, 'remote')
				break
			}
			case 'patch': {
				this.kernal.applyOps(message.ops, 'remote')
				break
			}
		}
	}
}
