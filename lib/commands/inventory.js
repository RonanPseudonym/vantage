const Discord = require('discord.js');
const mongo = require('../mongo.js');
const ui = require('../ui_toolkit.js');
const utils = require('../utils.js')

const items = utils.define('../assets/items.json')

module.exports = {
	name: 'inventory',
	usage: 'inventory (@user)',
	description: 'Show every item in your possession, or anyone you @mention',
	async execute(message, args) {
		let d = await mongo.users.get_data(message.author.id);
		usr = await ui.set_user(message);
        
		if(!usr) {return;}
		
		let data = [];

		let inv = d.items.inventory;
		let fields = [];

		
		for(let key in inv) {
			fields.push(["`"+inv[key]+"x` "+items[key].emoji+" "+utils.to_title_case(key), "`"+items[key].sale_price+"` Gold"]);
		}

		for(i=0;i<utils.split_arr(fields, 21).length+1;i++) {
			data.push({description: "Use these items with `use [item]`, or sell them with `sell [item]`", title:"Inventory", inline:true});
		}

		console.log(data);

		await ui.instantiate_turner(message, utils.split_arr(fields, 21), data);
	},
};