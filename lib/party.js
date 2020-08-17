class SPParty {
	constructor(mod) {
		this.players = new Map()
		this.members = []

		mod.hook('S_SPAWN_USER', 15, event => { this.players.set(event.gameId, event) })
		mod.hook('S_DESPAWN_USER', 3, event => { this.players.delete(event.gameId) })
		mod.hook('S_LOAD_TOPO', 'raw', () => { this.players.clear() })
		mod.hook('S_RETURN_TO_LOBBY', 'raw', () => { this.players.clear() })

		mod.hook('S_PARTY_MEMBER_LIST', 7, event => { this.members = event.members })
		mod.hook('S_LEAVE_PARTY', 'raw', () => { this.members = [] })
	}

	hasMember(gameId) {
		// Look up the target player by gameId
		const player = this.players.get(gameId)
		// Return true if this gameId belongs to a player whose serverId+playerId is in our party member list
		return player && this.members.some(member => member.serverId === player.serverId && member.playerId === player.playerId)
	}
}

module.exports = SPParty