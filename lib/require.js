const modMap = new WeakMap()

module.exports = function RequireMod(mod, path) {
	const modConstructor = require(path),
		dispatch = mod.dispatch

	let instanceMap = modMap.get(dispatch)
	if(!instanceMap) modMap.set(dispatch, instanceMap = new Map())

	let instance = instanceMap.get(modConstructor)
	if(!instance) instanceMap.set(modConstructor, instance = new modConstructor(mod))

	return instance
}