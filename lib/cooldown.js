Discord = require("discord.js");
const { users } = require("./mongo.js");
const mongo = require('./mongo.js');

async function add_cooldown(user, command, time) {
    user_data = await mongo.users.get_data(user.id);

    user_data.cooldowns[command] = Math.round(Date.now()/1000)+time;

    mongo.users.write_data(user.id, user_data);
}

async function get_cooldown(user, command) {
    if(await mongo.users.user_exists(user.author.id)) {
        user_data = await mongo.users.get_data(user.author.id);

        if(Object.keys(user_data.cooldowns).includes(command)) {
            if(user_data.cooldowns[command] >= Math.round(Date.now()/1000)) { 
                const embed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle("🕚 Wait `"+utils.seconds_to_time(user_data.cooldowns[command]-Math.round(Date.now()/1000))+"`")
                    .setDescription("You'll be able to use `"+command+"` shortly")
    
                user.channel.send(embed);
    
                return true;
            }
            else {
                delete user_data.cooldowns[command];
                mongo.users.write_data(user.author.id, user_data);
    
                return false;
            }
    
        } else {
            return false;
        }
    }

    return false;
}

module.exports = { add_cooldown, get_cooldown };