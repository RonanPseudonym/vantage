const ui = require('../ui_toolkit.js');
const utils = require('../utils.js');
const { exit } = require('process');
const mongo = require('../mongo.js');

const settings = utils.define('../assets/settings.json');
const admin = utils.define('../assets/admin.json');
const debug = utils.define('../assets/debug_settings.json');

function log(txt, message) {
	ui.tech_log(">"+(message.content.replace(settings.wake+"shell",""))+"\n"+txt, message);
}

module.exports = {
	name: 'shell',
	usage: 'shell [cmd]',
	description: "Control the bot and os via a number of system commands. Only avalible to admins [<@"+admin.id.join("> <@")+">]",

	async execute(message, args) {
        if(ui.auto_required_count(module.exports, message)){return;}

		if(!admin.id.includes(message.author.id.toString())) {
			await ui.err("🔐 You don't have admin status", message);
			return;
		}

		if(args.includes("-os")) {
			log(await utils.run(args.join(" ").replace("-os","")), message);
		}

		else if(args[0] == "quit") {
			exit();
		}

		if(args[0] == "drop") {
			if(args[1] == "users") {
				if(debug.ALLOW_TABLE_DROP){
					mongo.users.drop_table();
					await ui.tech_log("Dropped table Users", message);
				}
				else {
					await ui.err("ALLOW_TABLE_DROP disabled (./assets/debug_settings.json)")
				}
			}
		}
		
		if(args[0] == "load") {
			await ui.tech_log("Attempted "+args[1]+" load", message);
			return args[1];
		}

		if(args[0] == "beta") {
			await ui.tech_log("Switched to beta", message);
			return "beta";
		}

		if(args[0] == "alpha") {
			await ui.tech_log("Switched to alpha", message);
			return "alpha";
		}

		else {
			await ui.err("🤖 Invalid Command\n\nTo run a command on the terminal, use an `-os` flag", message);
		}
	},
};