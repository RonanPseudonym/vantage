const { MongoClient } = require('mongodb');
const Users = require('./user.js');
const utils = require('./utils.js')

class Mongo {
  constructor() {

    this.settings = utils.define("../assets/mongo_settings.json");

    this.client = new MongoClient(this.settings.url, this.settings.settings);
  }

  async init() {
    await this.client.connect();
    utils.header("Connected to MongoDB", utils.colors.green);

    this.db = this.client.db("vantage");
    utils.log("Connected to database Vantage", utils.colors.green);

    this.users = new Users(this.db);
    utils.log("Created users class, based off ./users.", utils.colors.green);

    utils.header("MongoDB Settings", utils.colors.green);
    
    utils.log("   Url        "+utils.colors.yellow+this.settings.url+utils.colors.reset);
    utils.log("   Settings { \n                         "+utils.colors.yellow+JSON.stringify(this.settings.settings).replace("{","").replace("}","").replace(/["']+/g, '').replace(/[:]+/g, '=').replace(/[,]+/g, '\n                         ')+utils.colors.reset+"\n              }");

    utils.header("MongoDB Setup Completed", utils.colors.green);
  }
}

module.exports = new Mongo();