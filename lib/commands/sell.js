const Discord = require('discord.js');
const mongo = require('../mongo.js');
const ui = require('../ui_toolkit.js');
const utils = require('../utils.js')

const items = utils.define('../assets/items.json');

var land_mapping = {"🌲":"eastwood","🌊":"luminar","🏔":"safling","🌵":"aragan"}

module.exports = {
    name: 'sell',
    usage: 'sell [amount] [item]',
    description: "Sell an item/items",
    async execute(message, args) { // A simple command to create a new user file

        if(ui.auto_required_count(module.exports, message)){return;}

        count = args[0];
        item = args.join(" ").replace(count+" ","");

        if(count>0) {
            if(Object.keys(items).includes(item)) {
                let i = items[item];

                    cost = i.sale_price*count;

                    let data = await mongo.users.get_data(message.author.id);

                    if(utils.count(utils.obj_to_arr(data.items.inventory), item) < count) {
                        ui.err("You don't have enough "+item, message);
                    } else {
                        await ui.add_check(message, "Sell "+count+"x "+utils.to_title_case(item)+" for "+cost+" gold", async function (emoji) {
                            if(emoji=="no") {await ui.err(count+"x "+utils.to_title_case(item)+" was not sold", message)}

                            else {
                                data.items.inventory[item] -= count;  
                                if(data.items.inventory[item]<=0) {
                                    delete data.items.inventory[item];
                                };

                                data.items.gold += cost;  

                                const embed = new Discord.MessageEmbed()
                                    .setColor('#0099ff')
                                    .setDescription(count+"x "+utils.to_title_case(item)+" sold!")
                                    .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com') 

                                await mongo.users.write_data(message.author.id, data);
                                await message.channel.send(embed);
                            }
                        });
                    }

            } else {
                await ui.err(utils.to_title_case(item)+" is not an item", message);
            }
        } else {
           ui.err("Nice try", message) 
        }
	}
};