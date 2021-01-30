/*
VANTAGE.JS 

CREATED: 1/18/2021
AUTHOR: PIXELDIP STUDIOS
DESCRIPTION: A CITY-BUILDING DISCORD BOT WRITTEN IN DISCORD.JS
*/

const Discord = require('discord.js');
const fs = require('fs');
const cooldown = require('./cooldown.js');
const { exit } = require('process');
const db = require('./mongo.js');
const utils = require('./utils.js');
const mongo = require('./mongo.js');
const ui = require('./ui_toolkit.js');

var commands = {};
var beta = true;

const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

console.clear()

var t0 = Date.now(); // Checking how long the program took to boot by subtracting the end time by the time it started (ms)

// ========== UTILS ==========

function is_server_valid(message) { // So that beta runs in beta
    return beta===(JSON.stringify(data.bot_data.beta_guild)==JSON.stringify(message.channel.guild.id)); // Unreadable, but it's fancy so I'll keep it
}

async function init_mongo() {
    await db.init();
}

// ========== LOADING JSON ==========

data = {};

header = utils.define('../assets/boot.json').title;

for(let i in header) {
    console.log(header[i]);
}

utils.log("BOT.JS BEGIN", utils.colors.blue);

utils.header("Load JSON Data");

const jsonData = fs.readdirSync('../assets').filter(file => file.endsWith('.json')); // Defining them by checking all the files in the commands folder
for (const file of jsonData) {
    data[file.replace(".json","")] = utils.define('../assets/'+file);
    utils.log("Loaded "+'../assets/'+file, utils.colors.green);
}

data['package'] = utils.define('../package.json');
utils.log("Loaded "+'../package.json', utils.colors.green);

// ========== DISCORD.JS INTERACTION ==========


const client = new Discord.Client();
client.commands = new Discord.Collection(); // A bunch of commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); // Defining them by checking all the files in the commands folder

utils.header("Load command files");

for (const file of commandFiles) {
    let d = utils.define_script("commands/"+file, client);
    commands[d[0]] = d[1];
}

utils.header("Commands");

console.log(typeof commands);
for(let i in commands) {
    utils.log('   '+i+" ".repeat(12-i.length)+utils.colors.yellow+commands[i]+utils.colors.reset);
}

client.once('ready', () => { // On bootup
    utils.header("Bot Online");

    client.user.setActivity(data.settings.status.text, { type: data.settings.status.type });
    utils.log('Changed status to '+data.settings.status.type+" "+data.settings.status.text, utils.colors.green);

    utils.header("Bot Data");
    utils.log('   Name        '+utils.colors.yellow+data.package.name+utils.colors.reset);
    utils.log('   Version     '+utils.colors.yellow+data.package.version+utils.colors.reset);
    utils.log('   Description '+utils.colors.yellow+data.package.description+utils.colors.reset);
    utils.log('   Git         '+utils.colors.yellow+data.package.repository.url+utils.colors.reset);
    utils.log('   Author      '+utils.colors.yellow+data.package.author+utils.colors.reset);

    utils.header("Booted in "+((Date.now()-t0)/1000)+" seconds")

    init_mongo()

    // console.log("")
    // utils.log("Shell Open", utils.colors.green)
    // shell();
});

client.on('message', async function(message) { // On message

    if(message.author.id!=message.client.user.id) {
            if(data.debug_settings.PRINT_COMMANDS){utils.log(message.content, utils.colors.yellow);}
            if(data.debug_settings.PRINT_USERS){console.log(message.author);}

            if(message.content.trim()[0] == data.settings.wake) { // If message conforms to $[command]
                if(message.author.bot) {
                    await ui.err("Discord bots can't use Vantage, for obvious reasons", message);
                } else {
                    let content = message.content.replace(data.settings.wake, "").toLowerCase(); // The message, but without '$'
                    let args = message.content.trim().split(/ +/); // Any additional arguments
                    let cmd = content.split(/ +/)[0];
                    args.splice(0, 1);

                    if(data.shortcuts.hasOwnProperty(cmd)){cmd = data.shortcuts[cmd];}

                    if(is_server_valid(message)) {

                        if(!await mongo.users.user_exists(message.author.id) && cmd != 'start') {
                            await ui.err("You don't have an account. Get one by using `start`", message);
                        }
                        else {
                            let cd = await cooldown.get_cooldown(message, cmd);

                            if(!cd) {

                                if(cmd in data.autoreply) {
                                    await message.channel.send(data.autoreply[cmd]);
                                    
                                } else {

                                    if(commands.hasOwnProperty(cmd)) {
                        
                                        try {
                                            if(args[0] == "help") {

                                                const embed = new Discord.MessageEmbed()
                                                    .setColor('#0099ff')
                                                    .setTitle("Usage: `"+client.commands.get(cmd).usage+"`")
                                                    .setDescription(client.commands.get(cmd).description)
                                    
                                                message.channel.send(embed);

                                            } else {

                                                let reply = await client.commands.get(cmd).execute(message, args);
                                                if(reply) {
                                                    if(reply=="beta"){ beta = true;}
                                                    else if(reply=="alpha"){ beta = false;}

                                                    else if(reply.split(".")[1] === "js") {
                                                        delete require.cache[require.resolve(`./${args[1]}`)];
                                                        utils.define_script(args[1], client)
                                                    }

                                                    else if(reply.split(".")[1] === "json") {
                                                        data[args[1].split(".")[0].split("/")[1]] = define("../"+args[1]);
                                                    }
                                                }

                                            }

                                        } catch (err) {
                                            utils.log('Command Execution Error', utils.colors.red);
                                            utils.log(err.stack, utils.colors.red);
                                        }
                                    }

                                    else {
                                        did_you_mean = [];
                                        for(key in commands) {
                                            if(utils.get_difference(cmd,key).length<3) {
                                                did_you_mean.push(commands[key]);
                                            }
                                        }

                                        let did_you_mean_str = "";
                                        if(did_you_mean.length>0) {
                                            did_you_mean_str = "\nDid you mean:\n`"+did_you_mean.join("`\n`")+"`";
                                        }

                                        await ui.err("Unknown command `"+cmd+"`\n"+did_you_mean_str, message);
                                    }
                                }

                            }
                        }
                    }
            }
        }
    }
    
})

// var shell = function () {
//     rl.question("", function (cmd) {
//         utils.log("Recived command "+cmd);

//         args = cmd.split(/ +/);

//         if(cmd === "quit"){exit()}
//         if(cmd === "drop users" && data.debug_settings.ALLOW_TABLE_DROP){mongo.users.drop_table()}

//         if(args[0] === "load"){ // Reloading scripts without restarting the whole program (works for all scripts, except this one)

//             if(args[1].split(".")[1] === "js") {
//                 delete require.cache[require.resolve(`./${args[1]}`)];
//                 utils.define_script(args[1], client)
//             }

//             if(args[1].split(".")[1] === "json") {
//                 data[args[1].split(".")[0].split("/")[1]] = define("../"+args[1]);
//             }

//         }

//         if(args[0]=="beta"){beta=true;utils.log("Switched to beta");} // Defining on which server(s) the commands are read
//         if(args[0]=="alpha"){beta=false;utils.log("Switched to alpha");}

//         shell();

//     });
// };

client.login(data.bot_data.token);  