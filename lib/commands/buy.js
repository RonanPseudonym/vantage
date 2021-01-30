const Discord = require('discord.js');
const mongo = require('../mongo.js');
const ui = require('../ui_toolkit.js');
const utils = require('../utils.js');
const perlin = require('../perlin_generate.js');

const items = utils.define('../assets/items.json');

var land_mapping = {"🌲":"eastwood","🌊":"luminar","🏔":"safling","🌵":"aragan"}

module.exports = {
    name: 'buy',
    usage: 'buy [amount] [item]',
    description: "Purchase an item. To buy land, type `buy land`",
    async execute(message, args) { // A simple command to create a new user file

        if(args[0] == "land") {
            const embed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Land')
                .setDescription('Land is vital to the expansion of your empire. There are four realms to choose from, **Eastwood**, **Luminar**, **Safling** and **Aragan**. Choose wisely, as each realms have both pros and cons. Choose which land to buy by reacting with the emojis below')
                .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com')
                .addFields(
                    {name:"🌲 Eastwood", value:"Eastwood is a forest realm, simple and calm. Food is plentiful, but rocks and other building materials are tricky to come by.", inline:true},
                    {name:"🌊 Luminar", value:"A beautiful land by the sea, fish and water are plentiful. Trees, however, are rare, making construction tricky.", inline:true},
                    {name:"🏔 Safling", value:"Safling is a mountainous realm, snowy and gorgeous. It has lots of building materials, but food and water is hard to come by.", inline:true},
                    {name:"🌵 Aragan", value:"A barren desert land, most food and water sources are virtually nonexistant. However, prickly cactus provide both food and water, and the rare Desert Lotus is of immense value.", inline:true},
                    {name:"💵 Prices", value:"Plots in these lands can be purchased for **100 Gold** each. Prices vary based on level.", inline:true},
                )

            await message.channel.send(embed)
                .then(async function (reply) {
                    await ui.reaction_system(reply, ["🌲","🌊","🏔","🌵"], message.author, [], async function (emoji) {
                        let land = land_mapping[emoji];

                        let data = await mongo.users.get_data(message.author.id);

                        if(data.items.gold>=100) {
                            data.items.gold -= 100;
                        } else {
                            ui.err("You don't have enough gold", message);
                            return;
                        }

                        if(Object.keys(data.items.inventory).includes(land)){data.items.inventory[land] ++;}
                        else{data.items.inventory[land] = 1;}

                        data.land["Plot "+(Object.keys(data.land).length+1)] = {
                            "population": 5,
                            "realm": land,
                            "perlin_map": perlin.perlin_2d()
                        }

                        const embed = new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle("Land in "+utils.to_title_case(land)+" purchased!")
                            .setDescription("You can build all sorts of things on your land, from wooden huts to giant castles. It's your choice!")
                            .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com') 

                        await mongo.users.write_data(message.author.id, data);
                        await message.channel.send(embed);
                    });
                });

        } else {

            count = args[0];
            item = args.join(" ").replace(count+" ","");

            if(count>0) {
                if(Object.keys(items).includes(item)) {
                    let i = items[item];

                    if(Object.keys(i.properties).includes("buy")) {
                        cost = i.sale_price*2*count;

                        let data = await mongo.users.get_data(message.author.id);

                        if(data.items.gold<cost) {
                            ui.err("You don't have enough gold", message);
                        } else {
                            await ui.add_check(message, "Buy "+count+"x "+utils.to_title_case(item)+" for "+cost+" gold", async function (emoji) {
                                if(emoji=="no") {await ui.err(utils.to_title_case(item)+" was not purchased", message)}

                                else {
                                    if(Object.keys(data.items.inventory).includes(item)){data.items.inventory[item] = Number(data.items.inventory[item])+Number(count);}
                                    else{data.items.inventory[item] = count;} 

                                    data.items.gold -= cost;  

                                    const embed = new Discord.MessageEmbed()
                                        .setColor('#0099ff')
                                        .setDescription(count+"x "+utils.to_title_case(item)+" purchased!")
                                        .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com') 

                                    await mongo.users.write_data(message.author.id, data);
                                    await message.channel.send(embed);
                                }
                            });
                        }

                    } else {
                        ui.err("You can't buy "+utils.to_title_case(item), message)
                    }

                } else {
                    await ui.err(utils.to_title_case(item)+" is not an item", message);
                }
            } else {
               ui.err("Nice try", message) 
            }
        }
	}
};