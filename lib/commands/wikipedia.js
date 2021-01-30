const Discord = require('discord.js');
const utils = require('../utils.js');
const ui = require("../ui_toolkit.js")

const graphics = utils.define('../assets/graphics.json');

async function get_wiki(query, message, callback) {
    var request = require('request');
    var url = `https://en.wikipedia.org/w/api.php?action=opensearch&search="+ ${query} +"&format=json`;
    request(url, async function (err, response, body) {
        if(err){
            console.log(err);
        } else {
            let wiki = JSON.parse(body);
            best_url = wiki[3][0];
            if(best_url===undefined) {
                ui.err("We were unable to find anything for your query `"+query+"`", message)
                return;
            }
            else {
            	let name = best_url.split("/wiki/")[1];
            	let new_url = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts|pageimages&exintro&explaintext&generator=search&gsrsearch=intitle:"+name+"&gsrlimit=1&redirects=1";

				request(new_url, async function (err, response, body) {
					wiki = JSON.parse(body);
					return callback(wiki);
				});
            }
        }
    });
}

module.exports = {
	name: 'wikipedia',
	usage: 'wikipedia [query]',
	description: 'Get info about something on wikipedia',

	async execute(message, args) {
		await get_wiki(args.join(" "), message, async function ($) {
			_data = $.query.pages[Object.keys($.query.pages)[0]];

			title = _data.title;
			text = _data.extract.split("\n")[0];
			if(text.length>2048){text = text.substring(0, 2045)+"...";}

			try {img = _data.thumbnail.source;}
			catch {img="https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png";}

            const embed = new Discord.MessageEmbed()
                .setColor(graphics.colors.sys)
                .setTitle(title)
                .setDescription(text)
                .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com')
				.setThumbnail(img.replace("50px", "500px"))

			await message.channel.send(embed)

			return;
		});
	},
};