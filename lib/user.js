fs = require("fs");
utils = require("./utils.js");
mongodb = require("mongodb");

class User {
    constructor(db) {
        this.collection = db.collection('users');
    }

    async create_user(message) {
        var usr =  {
            data: {
                username: message.author.tag,
                epoch_timestamp: Math.round(Date.now()/1000),
            }, 
            items: {
                "gold": 150,
                "inventory": {
                    "log": 10,
                    "stone": 3,
                    "potato": 5,
                    "water": 5,
                    "deluxe package": 1,
                },
            },
            land: {},
            cooldowns: {},
            _id: message.author.id
        }
        const newUser = await this.collection.insertOne(usr);
        return newUser;
    }

    async write_data(name, to_write) {
        await this.collection.updateOne({_id:name}, { $set: to_write }, function(err, res) {});
    }
    
    async get_data(name) {
        try {  return await this.collection.findOne({_id: name})
        } catch(err) { console.log(err) }
    }
    
    async drop_table() {
        await this.collection.drop(function(err, delOK) {
            if (err) throw err;
            if (delOK) utils.log("ALL USERS DELETED", utils.colors.green);
        })
    }

    async user_exists(id) {
        return Boolean(await this.collection.countDocuments({_id: id}, { limit: 1 }));
    }

    async delete_user(id) {
        await this.collection.deleteOne( {_id: id});
    }
}

module.exports = User;