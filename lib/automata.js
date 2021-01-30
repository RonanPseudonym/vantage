const fs = require('fs');
const items = JSON.parse(fs.readFileSync("../assets/items.json"));
const Discord = require("discord.js");
const cooldown = require('./cooldown.js');
const mongo = require('./mongo.js');
const utils = require('./utils.js');
const ui = require('./ui_toolkit.js');

async function get_items(realm, tag, pop) {
    let attempt_initial = Math.ceil(pop/10);
    let attempts = 0;

    for(let j=0;j<attempt_initial;j++){attempts += utils.get_random_int(3);};


    let viable_items = utils.get_filtered_items(tag, realm);
    let result = []

    for(k=0;k<attempts;k++) {
        let choice = utils.get_random_int(viable_items.length);

        result.push(viable_items[choice]);
    }

    return result;
}

async function add_items(id, tag) {
    let data = await mongo.users.get_data(id);
    let lots = Object.keys(data.land);

    if(lots.length<=0) {
        return false;
    }

    let items_obj = {};

    for(i=0;i<lots.length;i++) {
        let new_items = await get_items(data.land[lots[i]].realm, tag, data.land[lots[i]].population);

        items_obj[lots[i]] = new_items;

        for(l=0;l<new_items.length;l++) {
            if(Object.keys(data.items.inventory).includes(new_items[l])) {data.items.inventory[new_items[l]] ++;}
            else {data.items.inventory[new_items[l]] = 1;}
        }
    }

    await mongo.users.write_data(id, data);


    return items_obj;
}

async function instantiate_automata(data) {
    automata_data = await add_items(data.message.author.id, data.tag);

    if(!automata_data) {
        await ui.err("You don't have any land yet", data.message);
        return;
    }
    
    automata_keys = Object.keys(automata_data);

    amount = 0;
    fields = [];

    for(let n=0;n<automata_keys.length;n++) {
        amount += automata_data[automata_keys[n]].length;
        fields.push([automata_keys[n], automata_data[automata_keys[n]], true]);
    }

    let prettified_items = [];

    for(let p=0;p<fields.length;p++) {
        let i = utils.get_prettified_items(fields[p][1]);

        if(i.length>0) {
            prettified_items.push(i);
        }
    }
    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle(data.title.replace("{x}",amount))
        .setDescription(data.description)

    console.log(prettified_items);

    for(let o=0;o<fields.length;o++) {
        if(prettified_items[o].length>0) {
            embed.addField(fields[o][0], prettified_items[o].join("\n"), fields[o][2]);
        }
    }

    await data.message.channel.send(embed)

    await cooldown.add_cooldown(data.message.author, data.command, data.cooldown);
}

module.exports = {add_items, get_items, instantiate_automata };