'use strict'

const subMod = require('./require'),
	abnormals = require('../config/abnormalities')

class SPAbnormals {
	constructor(mod) {
		this.mod = mod

		this.player = subMod(mod, './player')
		this.ping = subMod(mod, './ping')

		this.myAbnormals = {}

		mod.hook('S_RETURN_TO_LOBBY', 1, () => { this.removeAll() })

		mod.hook('S_CREATURE_LIFE', 3, event => {
			if(event.gameId === this.player.gameId && !event.alive) this.removeAll()
		})

		let abnormalityUpdate = (type, event) => {
			if(event.target === this.player.gameId) {
				if(mod.settings.debug.abnormals) debug(abnormals[event.id] == true ? '<X' : '<-', type, event.id, event.duration, event.stacks)

				let info = abnormals[event.id]
				if(info) {
					if(info == true) return false

					if(info.overrides && this.exists(info.overrides)) this.remove(info.overrides)
				}

				if(event.duration != 0x7fffffff) event.duration = Math.max(event.duration - this.ping.min, 0)

				if(type === 'S_ABNORMALITY_BEGIN' === this.exists(event.id)) { // Transform packet type so it will always be valid
					this.add(event.id, event.duration, event.stacks)
					return false
				}

				this._add(event.id, event.duration)
				return true
			}
		}

		mod.hook('S_ABNORMALITY_BEGIN', mod.majorPatchVersion < 75 ? 2 : 3, abnormalityUpdate.bind(null, 'S_ABNORMALITY_BEGIN'))
		mod.hook('S_ABNORMALITY_REFRESH', 1, abnormalityUpdate.bind(null, 'S_ABNORMALITY_REFRESH'))

		mod.hook('S_ABNORMALITY_END', 1, event => {
			if(event.target === this.player.gameId) {
				if(mod.settings.debug.abnormals) debug(abnormals[event.id] == true ? '<X' : '<-', 'S_ABNORMALITY_END', event.id)

				if(abnormals[event.id] == true) return false

				if(!this.myAbnormals[event.id]) return false

				this._remove(event.id)
			}
		})
	}

	exists(id) {
		return !!this.myAbnormals[id]
	}

	inMap(map) {
		for(let id in this.myAbnormals)
			if(map[id]) return true
		return false
	}

	add(id, duration, stacks) {
		let type = this.myAbnormals[id] ? 'S_ABNORMALITY_REFRESH' : 'S_ABNORMALITY_BEGIN',
			version = this.myAbnormals[id] ? 1 : (this.mod.majorPatchVersion < 75 ? 2 : 3)

		if(this.mod.settings.debug.abnormals) debug('<*', type, id, duration, stacks)

		this.mod.toClient(type, version, {
			target: this.player.gameId,
			source: this.player.gameId,
			id,
			duration,
			unk: 0,
			stacks,
			unk2: 0
		})

		this._add(id, duration)
	}

	remove(id) {
		if(!this.exists(id)) return

		if(this.mod.settings.debug.abnormals) debug('<* S_ABNORMALITY_END', id)

		this.mod.toClient('S_ABNORMALITY_END', 1, {
			target: this.player.gameId,
			id
		})

		this._remove(id)
	}

	removeAll() {
		for(let id in this.myAbnormals) this.remove(id)
	}

	_add(id, duration) {
		this.mod.clearTimeout(this.myAbnormals[id])
		this.myAbnormals[id] = duration >= 0x7fffffff ? true : this.mod.setTimeout(() => { this.remove(id) }, duration)
	}

	_remove(id) {
		this.mod.clearTimeout(this.myAbnormals[id])
		delete this.myAbnormals[id]
	}
}

function debug() {
	console.log(`[${(Date.now() % 10000).toString().padStart(4, '0')}]`, ...arguments)
}

module.exports = SPAbnormals