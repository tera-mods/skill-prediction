'use strict'

const NOCTAN = new Set([1206, 1210, 1230, 1300, 1301, 1302, 1303, 81212, 201225]),
	HOOK_LAST = {order: 100, filter: {fake: null}}

class SPPlayer {
	reset() {
		Object.assign(this, {
			// Session
			gameId: -1n,
			templateId: -1,
			race: -1,
			job: -1,

			// Status
			mounted: false,

			// Combat stats
			attackSpeed: 1,
			stamina: 0,

			// Crests
			crests: new Set(),

			// EP
			epPerks: new Set(),

			// Equipment / Inventory
			hasWeapon: false,
			hasNocTan: false,
			itemPassives: []
		})
	}

	constructor(mod) {
		this.reset()

		mod.hook('S_LOGIN', 13, HOOK_LAST, event => {
			this.reset()

			Object.assign(this, {
				gameId: event.gameId,
				templateId: event.templateId,
				race: Math.floor(event.templateId / 100) % 100 - 1,
				job: event.templateId % 100 - 1
			})
		})

		mod.hook('S_RETURN_TO_LOBBY', 'raw', () => { this.reset() })

		// Status
		mod.hook('S_MOUNT_VEHICLE', 2, event => { if(event.gameId === this.gameId) this.mounted = true })
		mod.hook('S_UNMOUNT_VEHICLE', 2, event => { if(event.gameId === this.gameId) this.mounted = false })

		// Combat stats
		mod.hook('S_PLAYER_STAT_UPDATE', 10, HOOK_LAST, event => {
			Object.assign(this, {
				// Newer classes use a different speed algorithm
				attackSpeed: (event.attackSpeed + event.attackSpeedBonus) / (this.job >= 8 ? 100 : event.attackSpeed),
				stamina: event.stamina
			})
		})

		mod.hook('S_PLAYER_CHANGE_STAMINA', 1, HOOK_LAST, event => { this.stamina = event.current })

		// Crests
		mod.hook('S_CREST_INFO', 2, event => { this.crests = new Set(event.crests.filter(c => c.enable).map(c => c.id)) })
		mod.hook('S_CREST_APPLY', 2, event => { this.crests[event.enable ? 'add' : 'delete'](event.id) })

		// EP
		for(let packet of ['S_LOAD_EP_INFO', 'S_LEARN_EP_PERK'])
			mod.hook(packet, 1, HOOK_LAST, event => {
				this.epPerks.clear()
				for(let p of event.perks) this.epPerks.add(`${p.id},${p.level}`)
			})

		// Equipment / Inventory
		const {inventory} = mod.require.game
		inventory.on('update', () => {
			this.hasWeapon = inventory.equipment.has(1)
			this.hasNocTan = inventory.items.some(item => NOCTAN.has(item.id))

			this.itemPassives = []
			for(let item of inventory.equipment.values()) {
				for(let id of item.passivitySets.find(s => s.index === item.passivitySet).passivities)
					if(id) this.itemPassives.push(id)

				this.itemPassives.push(...item.mergedPassivities)
			}
		})
	}
}

module.exports = SPPlayer