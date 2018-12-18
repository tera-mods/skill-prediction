'use strict'

const PRELOAD = ['./core', './commands']

for(let name of PRELOAD) require(name)

const subMod = require('./require')

module.exports = function SkillPrediction(mod) {
	if(!mod.info._path) {
		console.error(`ERROR: Your version of tera-proxy is too old to run Skill Prediction.
Download the latest version from:\n  https://github.com/tera-proxy/tera-proxy/releases`)
		return
	}

	for(let name of PRELOAD) subMod(mod, name)
}