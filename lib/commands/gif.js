const Discord = require('discord.js');
const utils = require('../utils.js');
const ui = require('../ui_toolkit.js');



const Tenor = require("tenorjs").client({
    // Replace with your own key
    "Key": utils.define("../assets/api_keys.json").tenor, // https://tenor.com/developer/keyregistration
    "Filter": "high", // "off", "low", "medium", "high", not case sensitive
    "Locale": "en_US", // Your locale here, case-sensitivity depends on input
});

module.exports = {
    name: 'gif',
    usage: 'gif [subject]',
    description: "Get a gif on any subject",

    async execute(message, args) { // A simple command to create a new user file
    	if(ui.auto_required_count(module.exports, message)){return;}

    	Tenor.Search.Query(args.join(" "), "1")
        .then(async function (response) {
            try {await message.channel.send(response[0].url);}
            catch {await ui.err("No tenor gifs found for query `"+args.join(" ")+"`", message);}
        }).catch(console.error);
    }
};
