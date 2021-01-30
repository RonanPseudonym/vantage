const Discord = require('discord.js');
const mongo = require('../mongo.js');
const utils = require('../utils.js');
const ui = require("../ui_toolkit.js");

const graphics = utils.define("../assets/graphics.json");
module.exports = {
	name: 'xkcd',
	usage: 'xkcd (*rand || num)',
    description: "Fetch an XKCD comic (recent, random or of choice)",
	async execute(message, args) { // A command to return a 'pong' and round-trip latency when called (https://discordjs.guide/popular-topics/embeds.html#using-the-richembedmessageembed-constructor, https://stackoverflow.com/questions/63411268/discord-js-ping-command)
        utils.newest_xkcd( async function (number) {
            if(args.includes("rand")) {
                num = utils.get_random_int(number)
            } else if (args.length==1) {
                if(utils.is_num(args[0]) && Number(args[0]) > 0 && Number(args[0]) <= number) {
                    num = args[0];
                } else {
                    await ui.err("You must provide no arguments, the `rand` argument or a integer between 1 and "+number+" to get an XKCD comic", message);
                    return;
                }

            } else {
                num = number;
            }

            await utils.get_html("https://www.xkcd.com/"+num, async function ($) {
                try {
                    const embed = new Discord.MessageEmbed()
                        .setColor(graphics.colors.sys)
                        .setTitle("`"+num+"` "+$('div [id="ctitle"]').text())
                        .setImage("https:"+$('div [id="comic"]').find('img').attr('src'))
                        .setThumbnail("https://www.xkcd.com/s/0b7742.png")
                        .setDescription($('div [id="comic"]').find('img').attr('title'))
                        .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com')

                    await message.channel.send(embed);

                } catch {
                    ui.err("That comic can't be viewed on Discord. ("+"https://www.xkcd.com/"+num+")", message)
                }
            });
        });
	},
};