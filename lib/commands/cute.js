const Discord = require('discord.js');
const utils = require('../utils.js');
const ui = require('../ui_toolkit.js');

const Tenor = require("tenorjs").client({
    // Replace with your own key
    "Key": utils.define("../assets/api_keys.json").tenor, // https://tenor.com/developer/keyregistration
    "Filter": "high", // "off", "low", "medium", "high", not case sensitive
    "Locale": "en_US", // Your locale here, case-sensitivity depends on input
});

var queries = ["cute cat","cute dog","cute baby yoda"]

async function get_gifs(i, urls, message) {
    if(i<queries.length) {
        Tenor.Search.Query(queries[i], "10")
        .then(async function (response) {
            for(j in response) {
                urls.push(response[j].url)
            }

            get_gifs(i+1, urls, message);
        }).catch(console.error);
    } else {
        url = urls[utils.get_random_int(urls.length-1)];
        await message.channel.send(url);
    }
}

module.exports = {
    name: 'cute',
    usage: 'cute',
    description: "Get a cute gif",

    async execute(message, args) { // A simple command to create a new user file
    	if(ui.auto_required_count(module.exports, message)){return;}
        get_gifs(0, [], message);
    }
};
