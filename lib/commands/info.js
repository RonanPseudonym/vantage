const { fork } = require('child_process');
const Discord = require('discord.js');
const fs = require("fs");

const items = JSON.parse(fs.readFileSync('../assets/items.json'));
const recipes = JSON.parse(fs.readFileSync('../assets/recipes.json'));

const utils = require('../utils.js');
const ui = require('../ui_toolkit.js');

module.exports = {
    name: 'info',
    usage: 'info [item]',
    description: 'Get information about any item.',

    async execute(message, args) {

        if(ui.auto_required_count(module.exports, message)){return;}

        if(!Object.keys(items).includes(args.join(" "))) {
            ui.err("I don't know what `"+args.join(" ")+"` is", message);
            return;
        }

        item = items[args.join(" ")];
        
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle(item.emoji+" "+utils.to_title_case(args.join(" ")))
            .setDescription(item.description)
            .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com')
            .addFields(
                {name:"Sale Price",value:"`"+item.sale_price+"` Gold", inline:true},
                {name:"Purchase Price",value:"`"+(item.sale_price*2)+"` Gold", inline:true}
            )

        let fields = Object.keys(item);

        let properties = item.properties;
        let p_keys = Object.keys(properties);
        let properties_arr = []

        for(let i in p_keys) {
            if(properties[p_keys[i]] == null) {properties_arr.push(utils.to_title_case(p_keys[i]))}
            else {properties_arr.push("`+"+properties[p_keys[i]]+"` "+utils.to_title_case(p_keys[i]))}
        }

        embed.addField("Properties", properties_arr.join("\n"),true);

        for(let i in fields) {
            if(![ 'emoji', 'description', 'sale_price', 'properties' ].includes(fields[i])) {
                let stats = item[fields[i]];
                let stat_keys = Object.keys(stats);
                let chances = [];

                for(let j in stat_keys) {
                    let all = utils.get_filtered_items(fields[i], stat_keys[j]);
                    let item_count = utils.count(all, args.join(" "));
                    let percent = Math.round(((100/all.length)*item_count)*100)/100; // The percent of all items in area that also equal queried item

                    chances.push(utils.to_title_case(stat_keys[j])+": "+" "+"`"+percent+"%`");
                }

                embed.addField(utils.to_title_case(fields[i])+" Data", chances.join("\n"),true);
            }
        }

        if(Object.keys(recipes).includes(args.join(" "))) {
            embed.addField("Crafting", utils.format_recipes(args.join(" ")).join("\n"),true);
        }

        await message.channel.send(embed);
	}
};