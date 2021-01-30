const Discord = require('discord.js');
const utils = require('../utils.js');
const ui = require('../ui_toolkit.js')

const tz = utils.define('../assets/timezones.json');
const graphics = utils.define('../assets/graphics.json');

const l = graphics.letters;

module.exports = {
	name: 'timezone',
	usage: 'timezone',
	description: 'Change the timezone for your town',

	async execute(message, args) {

		if(ui.auto_required_count(module.exports, message)){return;}

		const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Pick a timezone')
			.setDescription('This information is used to configure the time in your town. It will now be shared or sold.')
		
		let count = 0;		
		let emojis = [];

		for(i in tz) {

			embed.addField(l[count]+" "+i, tz[i][0], true);
			emojis.push(l[count]);
			count ++;
		}

		embed.addField("Select a timezone by reacting with the emojis below", "You can always change this later", true);

		await message.channel.send(embed).then(async function (reply) {
			await ui.reaction_system(reply, emojis, message.author, [], async function (emoji) {
				console.log(emoji);
			});
		});
	},
};