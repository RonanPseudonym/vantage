const Discord = require('discord.js');
const utils = require('../utils.js');

module.exports = {
	name: '',
	usage: '',
	description: '',

	async execute(message, args) {
		if(ui.auto_required_count(module.exports, message)){return;}

		const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('')
			.setDescription('')

		await message.channel.send(embed)
	},
};