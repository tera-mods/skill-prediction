'use strict'

const subMod = require('./require')

class SPCooldowns {
	constructor(mod) {
		this.loaded = false
		this.mod = mod
		this.timeouts = new Map()
		this.hooks = []

		this.load()
	}

	load() {
		if(this.loaded) return

		const ping = subMod(this.mod, './ping'),
			hook = (...args) => { this.hooks.push(this.mod.hook(...args)) },
			handle = event => {
				if(event.cooldown > 0) {
					event.cooldown = Math.max(0, event.cooldown - ping.min)
					this.set(event.skill.id, event.cooldown)
					return true
				}

				this.end(event.skill.id)
			}

		hook('S_START_COOLTIME_SKILL', 3, handle)
		hook('S_DECREASE_COOLTIME_SKILL', 3, handle)
		hook('S_LOAD_TOPO', 'raw', () => { this.reset() })

		this.loaded = true
	}

	check(id) { return this.timeouts.has(id) }

	set(id, time) {
		this.end(id)

		if(time > 0) this.timeouts.set(id, setTimeout(() => { this.end(id) }, time))
	}

	end(id) {
		clearTimeout(this.timeouts.get(id))
		this.timeouts.delete(id)
	}

	reset() {
		for(let id of this.timeouts.keys()) this.end(id)
	}

	unload() {
		if(!this.loaded) return

		reset()

		for(let hook of this.hooks) this.mod.unhook(hook)

		this.hooks = []
		this.loaded = false
	}
}

module.exports = SPCooldowns