const Discord = require('discord.js');
const utils = require('../utils.js');
const mongo = require('../mongo.js');
const ui = require('../ui_toolkit.js');
const l = utils.define('../assets/land_data.json'); 

module.exports = {
	name: 'town',
	usage: 'town',
	description: 'Get info about your towns',

	async execute(message, args) {
		const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('')
			.setDescription('')

		let d = await mongo.users.get_data(message.author.id);
		let land = d.land;

		let _data = [];
		let fields = [];

		for(let key in land) {

			let town_data = [];
			let pd = land[key].perlin_map;

			for(let q=0;q<12;q++) {
				let row = [];
				for(let r=0;r<12;r++) {
					if(r == 9 && q == 8) { row.push("🇳");}
					else if(r == 9 && q == 10) { row.push("🇸")}
					else if(r == 10 && q == 9) { row.push("🇪")}
					else if(r == 8 && q == 9) { row.push("🇼")}
					else {
						let cpd = pd[q][r].toString(); // Current Perlin Data [cpd]
						row.push(cpd.replace(1, l[land[key].realm].block).replace(0, graphics.emoji.blank));
					}
				}

				town_data.push(row.join(""));
			}

			_data.push({"title":key, "description":town_data.join("\n"), "inline":true});
			fields.push(
				[
					[
						"Data","🏞 Realm: `"+utils.to_title_case(land[key].realm)+"`\n👤 Population: `"+land[key].population+"`\n🏠 Space: `"+utils.count_2d(pd, "0")+"` `"+Math.round(((utils.count_2d(pd, "0")/144)*100), 2)+"%`"
					]
				]);
		};

		await ui.instantiate_turner(message, fields, _data);

		// await message.channel.send(embed)
	},
};