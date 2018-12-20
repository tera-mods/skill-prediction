'use strict'

const PRELOAD = ['./core', './commands']

for(let name of PRELOAD) require(name)

const subMod = require('./require')

module.exports = function SkillPrediction(mod) {
	if(!mod.settings.$init) {
		console.error(`ERROR: Your version of tera-proxy is too old to run Skill Prediction.
Download the latest version from:\n  https://codeload.github.com/tera-proxy/tera-proxy/zip/cli`)
		return
	}

	for(let name of PRELOAD) subMod(mod, name)
}