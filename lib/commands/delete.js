const Discord = require('discord.js');
const mongo = require('../mongo.js');
const ui = require('../ui_toolkit.js');

module.exports = {
    name: 'delete',
    usage: 'delete',
    description: 'Delete your account. This is irreversible, so choose wisely!',
    async execute(message, args) {
        await mongo.users.delete_user(message.author.id);
        
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Account deleted')
            .setDescription("Hello darkness my old friend")
            .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com')

        await message.channel.send(embed);
	}
};