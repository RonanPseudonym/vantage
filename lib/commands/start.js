const Discord = require('discord.js');
const mongo = require('../mongo.js');
const ui = require('../ui_toolkit.js');

module.exports = {
    name: 'start',
    usage: 'start',
    decription: "Create an account to interact with Vantage",
    async execute(message, args) { // A simple command to create a new user file
        if(await mongo.users.user_exists(message.author.id)) {
            ui.err("You're already a registered user", message);
            return;
        }

        await mongo.users.create_user(message);
        
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Welcome to Vantage!')
            .setDescription('Start your town by buying land, by using `buy land`. We gave you `150 Gold`, enough to buy some land and a few houses.')
            .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com')

        await message.channel.send(embed);
	}
};