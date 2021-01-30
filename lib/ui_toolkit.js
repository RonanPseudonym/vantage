const Discord = require('discord.js');
const utils = require('./utils.js');
const mongo = require('./mongo.js');
const os = require('os');
const graphics = utils.define('../assets/graphics.json');

module.exports = {
    async err(txt, message) {
        const embed = new Discord.MessageEmbed()
            .setColor(graphics.colors.err)
            .setDescription(txt)
            .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com')

        await message.channel.send(embed);
    },

    async await_reply(message, bot_id, callback) {
        await message.channel.awaitMessages( async function (msg) {
            if(msg.author.id == message.author.id) {
                let m = Array.from((msg.mentions.users).keys());
                
                if(m.length==1) {
                    if(m[0] == bot_id) {
                        return callback(msg.content);
                    }
                }
            };

            return callback(await module.exports.await_reply(message, bot_id));
        });
    },

    async reaction_system(message, emojis, author, emoji_custom, callback) {
        if(emoji_custom.length<1){emoji_custom=emojis;};

        console.log(emoji_custom)

        for(let i in emojis) {
            await message.react(emojis[i]);
        }

        message.awaitReactions(function (reaction, user) {
            if(user.id==author.id) {
                if(emoji_custom.includes(reaction.emoji.name)) {
                    return callback(reaction.emoji.name);
                }
            }
        })
    },

    async tech_log(txt, message) {
        const embed = new Discord.MessageEmbed()
            .setColor(graphics.colors.boring)
            .setDescription("```\n"+txt+"\n```")
            .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com')
            .addFields(
                    {name:"IP Address",value:"`"+utils.ip()+"`", inline:true},
                    {name:"Server Name",value:"`"+os.hostname()+"`",inline:true}
                )

        await message.channel.send(embed);
    },

    async add_check(message, title, callback) {
        const embed = new Discord.MessageEmbed()
            .setColor(graphics.colors.sys)
            .setDescription("React with the emojis below")
            .setTitle(title)
            .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com') 
        
        await message.channel.send(embed)
            .then(async function (reply) {
                await module.exports.reaction_system(reply, [graphics.emoji.yes, graphics.emoji.no], message.author, ["yes","no"], function (emoji) {
                    return callback(emoji);
                });
            });
    },

    async draw_turner(message, fields, data, page, original_reply) {
        var embed = new Discord.MessageEmbed()
            .setColor(graphics.colors.sys)
            .setDescription(data[page].description)
            .setTitle(data[page].title)
            .setAuthor(message.author.username, message.author.avatarURL(), 'https://vantage.pixeldip.com')

        for(i in fields[page]) {
            if(i < fields[page].length) {
                embed.addField(fields[page][i][0], fields[page][i][1], data[page].inline);
            }
        }

        message.channel.send(embed)
            .then(async function (reply) {

                if(original_reply!=undefined) {
                    await original_reply.delete()
                }

                reply.react("◀️");
                reply.react("▶️");

                reply.awaitReactions(async function (reaction, user) {
                    if(user.id==message.author.id) {
                        if(["◀️","▶️"].includes(reaction.emoji.name)) {
                            if(reaction.emoji.name == "◀️") {
                                if(page == 0) {
                                    page = fields.length-1;
                                } else {
                                    page --;
                                }
                            }

                            if(reaction.emoji.name == "▶️") {
                                if(page == fields.length-1) {
                                    page = 0;
                                } else {
                                    page ++;
                                }
                            }

                            module.exports.draw_turner(message, fields, data, page, reply);
                        }
                    }
                })
            })
    },

    async instantiate_turner(message, fields, _data) {
        let page = 0;

        await module.exports.draw_turner(message, fields, _data, page);
    },

    auto_required_count(self, message) {
        brackets = self.usage.split("[").length-1;
        if((message.content.split(" ").length-1)<brackets) {
            module.exports.err("The correct format for `"+self.name+"` is `"+self.usage+"`", message);
            return true;
        }
        return false;
    },

    async set_user(message) {
        if(message.mentions.members.size) {
            exists = await mongo.users.user_exists(message.mentions.members.first().id);

            if(exists) {
                return message.mentions.users.first();
            }
            else {
                module.exports.err("<@"+message.mentions.members.first()+"> isn't on Vantage (for some reason)", message);
                return false;
            }
        }
        else {
            return message.author;
        }
    },
}