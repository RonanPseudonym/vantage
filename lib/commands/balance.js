const Discord = require('discord.js');
const mongo = require('../mongo.js');
const utils = require('../utils.js');
const ui = require('../ui_toolkit.js');

graphics = utils.define("../assets/graphics.json");

module.exports = {
	name: 'balance',
	usage: 'balance (@user)',
    description: "Get the curent balence of yourself, or anyone @mentioned",
	async execute(message, args) { // A command to return a 'pong' and round-trip latency when called (https://discordjs.guide/popular-topics/embeds.html#using-the-richembedmessageembed-constructor, https://stackoverflow.com/questions/63411268/discord-js-ping-command)
        
        usr = await ui.set_user(message);
        
        if(!usr) {return;}
        
        let data = await mongo.users.get_data(usr.id);
        let bal = data.items.gold;

        const embed = new Discord.MessageEmbed()
            .setColor(graphics.colors.sys)
            .setDescription("🪙 `"+bal+"`")
            .setAuthor(usr.username, usr.avatarURL(), 'https://vantage.pixeldip.com')

        await message.channel.send(embed);
	},
};