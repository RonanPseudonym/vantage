const Discord = require('discord.js');
const mongo = require('../mongo.js');
const ui = require('../ui_toolkit.js');
const utils = require('../utils.js')

const recipes = utils.define('../assets/recipes.json');

var land_mapping = {"🌲":"eastwood","🌊":"luminar","🏔":"safling","🌵":"aragan"}

module.exports = {
    name: 'craft',
    usage: 'craft [amount] [item]',
    description: "Craft an item/items",
    async execute(message, args) { // A simple command to create a new user file

        if(ui.auto_required_count(module.exports, message)){return;}

        count = args[0];
        item = args.join(" ").replace(count+" ","");

        if(count>0) {
            if(Object.keys(recipes).includes(item)) {
                let i = recipes[item];

                    let data = await mongo.users.get_data(message.author.id);
                    let valid = true;

                    for(let j in i) {
                        console.log(utils.obj_to_arr(data.items.inventory), j, i[j])
                        if(utils.count(utils.obj_to_arr(data.items.inventory), j) < i[j]*count) {
                            valid = false;
                            break;
                        }
                    }

                    if(!valid) {
                        ui.err("You don't have "+utils.format_recipes(item, count).join(", "), message);
                    } else {
                        await ui.add_check(message, "Craft `"+count+"x` "+item+" with "+utils.format_recipes(item, count).join(", "), async function (emoji) {
                            if(emoji=="no") {await ui.err(count+"x "+utils.to_title_case(item)+" was not crafted", message)}

                            else {
                                for(let j in i) {
                                    data.items.inventory[j] -= i[j];  
                                    if(data.items.inventory[j]<=0) {
                                        delete data.items.inventory[i[j]];
                                    };
                                }

                                if(Object.keys(data.items.inventory).includes(item)){data.items.inventory[item] = Number(data.items.inventory[item]) + Number(count);}
                                else{data.items.inventory[item] = Number(count);}

                                const embed = new Discord.MessageEmbed()
                                    .setColor('#0099ff')
                                    .setDescription(count+"x "+utils.to_title_case(item)+" crafted!")
                                    .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com') 

                                await mongo.users.write_data(message.author.id, data);
                                await message.channel.send(embed);
                            }
                        });
                    }

            } else {
                await ui.err(utils.to_title_case(item)+" is not craftable", message);
            }
        } else {
           ui.err("Nice try", message) 
        }
	}
};