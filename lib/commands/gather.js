const automata = require('../automata.js');

module.exports = {
	name: 'gather',
	usage: 'gather',
	description: "Gather items from around your lands. Items change based on realm.",
	async execute(message, args) {
		await automata.instantiate_automata({"message":message,"tag":"gather","title":"You found {x} items","description":"Use these items to feed your towns, sell for gold, or craft new structures.","command":"gather","cooldown":60});
	},
};