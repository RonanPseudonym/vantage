const utils = require('../utils.js');
const ui = require('../ui_toolkit.js')

var {google} = require('googleapis');
var youtubeV3 = google.youtube( { version: 'v3', auth: utils.define("../assets/api_keys.json").yt } );

const Discord = require('discord.js');

module.exports = {
	name: 'youtube',
	usage: 'youtube [query]',
	description: 'Get a youtube video for a given query',

	async execute(message, args) { // A command to return a 'pong' and round-trip latency when called (https://discordjs.guide/popular-topics/embeds.html#using-the-richembedmessageembed-constructor, https://stackoverflow.com/questions/63411268/discord-js-ping-command)
		var request =  youtubeV3.search.list({
		    part: 'snippet',
		    type: 'video',
		    q: args.join(" "),
		    maxResults: 1,
		    order: 'relevance',
		    safeSearch: 'moderate',
		    videoEmbeddable: true
		}, async (err,response) => {
		  try {await message.channel.send("https://www.youtube.com/watch?v="+response.data.items[0].id.videoId);}
		  catch {await ui.err("Invalid query `"+args.join(" ")+"`", message);}
		});
	},
};