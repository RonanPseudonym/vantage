const Discord = require('discord.js');

module.exports = {
	name: 'ping',
	usage: 'ping',
	description: 'Get the roundtrip latency of the server',

	async execute(message, args) { // A command to return a 'pong' and round-trip latency when called (https://discordjs.guide/popular-topics/embeds.html#using-the-richembedmessageembed-constructor, https://stackoverflow.com/questions/63411268/discord-js-ping-command)
		message.channel.send('Pinging...').then(async function (sent) {
			const embed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('🏓 Pong')
				.addFields(
					{ name: 'Roundtrip Latency', value: "`"+(sent.createdTimestamp - message.createdTimestamp)+"ms`"}
				)

			await message.channel.send(embed)
		});
	},
};