const Discord = require('discord.js');
const mongo = require('../mongo.js');
const ui = require('../ui_toolkit.js');
const utils = require('../utils.js')

const items = utils.define('../assets/items.json');
const graphics = utils.define('../assets/graphics.json');
const l = utils.define('../assets/land_data.json'); 

async function parse_coordinates(message, reply, index) {
    while(true) {
        await ui.await_reply(message, reply.author.id, async function (text) {
            if(text.length==2) {
                let x = graphics.alphabet.indexOf(text[1]);
                let y = graphics.alphabet.indexOf(text[0]);

                let d = await mongo.users.get_data(message.author.id);

                let land_map = d.land[Object.keys(d.land)[index]].perlin_map;

                console.log(land_map)

                if(land_map[y][x] == 0) {
                    d.land[Object.keys(d.land)[index]].perlin_map[y][x] = items[item].emoji;

                    d.items.inventory[item] --;
                    if(d.items.inventory[item] <= 0) {delete d.items.inventory[item]};

                    mongo.users.write_data(message.author.id, d);

                    let embed = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setDescription('Item added')

                    await message.channel.send(embed);
                    return;

                } else {
                    ui.err("That space is already occupied", message);
                }
            } else {
                console.log("TEXT: "+text);
                ui.err("Invalid format - make sure to ommit the wakeword", message);
            }
        })
    }
}

module.exports = {
    name: 'use',
    usage: 'use [item]',
    description: "Add an item to your land",
    async execute(message, args) { // A simple command to create a new user file

        if(ui.auto_required_count(module.exports, message)){return;}

        item = args.join(" ");

        if(Object.keys(items).includes(item)) {
            let i = items[item];

                let data = await mongo.users.get_data(message.author.id);

                if(!Object.keys(data.items.inventory).includes(item)) {
                    ui.err("You don't have a "+item, message);
                } else {
                    let d = await mongo.users.get_data(message.author.id);
                    let land = d.land;
                    let count = 0;

                    let embed = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('Select a plot')
                        .setDescription('React with the emojis below')

                    for(let key in land) {
                        embed.addField(graphics.letters[count]+" "+key, utils.to_title_case(land[key].realm)+" - `"+utils.count_2d(land[key].perlin_map, "0")+"` Space")

                        count ++;
                    }

                    await message.channel.send(embed).then(async function (reply) {
                        await ui.reaction_system(reply, utils.split_arr(graphics.letters, Object.keys(land).length)[0], message.author, [], async function (emoji) {
                            console.log(emoji);
                            let index = graphics.letters.indexOf(emoji);

                            let town_data = ["🧭​"+utils.split_arr(graphics.letters, 12)[0].join("​")];
                            let key = Object.keys(land)[index];
                            let pd = land[key].perlin_map;



                            for(let q=0;q<12;q++) {
                                let row = [graphics.letters[q]];
                                for(let r=0;r<12;r++) {
                                    let cpd = pd[q][r].toString(); // Current Perlin Data [cpd]
                                    row.push(cpd.replace(1, l[land[key].realm].block).replace(0, graphics.emoji.blank));
                                }

                                town_data.push(row.join(""));
                            }

                            let embed = new Discord.MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle('Select a location')
                                .setDescription("Reply with your location choice (ie `cb`, for row 3 column 2). Remember to actually press the reply button, instead of just typing.\n\n"+town_data.join("\n"))

                            console.log(utils.split_arr(graphics.letters, 12)[0]);

                            await message.channel.send(embed).then(async function (reply) {
                                parse_coordinates(message, reply, index);
                            })
                        })
                    })

                }

        } else {
            await ui.err(utils.to_title_case(item)+" is not an item", message);
        }
	}
};