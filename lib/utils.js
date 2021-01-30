const items = JSON.parse(fs.readFileSync("../assets/items.json"));
const recipes = JSON.parse(fs.readFileSync("../assets/recipes.json"));
const debug = JSON.parse(fs.readFileSync("../assets/debug_settings.json"));
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)
const got = require('got');
const cheerio = require('cheerio');

colors = {
    "reset":"\x1b[0m",
    "green":"\x1b[32m",
    "red":"\x1b[31m",
    "blue":"\x1b[1m\x1b[34m",
    "yellow":"\x1b[33m",
};

module.exports = {
    get_html(url, callback) {
        got(url).then(response => {
            return callback(cheerio.load(response.body));
        }).catch(err => {
            console.log(err);
        });
    },

    format_recipes(item, multiple) {
        let d = recipes[item];
        let components = [];

        if(multiple===undefined){multiple=1;}

        for(let i in d) {
            let name = items[i].emoji+" "+utils.to_title_case(i);
            components.push("`"+d[i]*multiple+"x` "+name)
        }

        return components;
    },

    obj_to_arr(obj) {
        let arr = [];
        for(key in obj) {
            for(let i=0;i<obj[key];i++) {
                arr.push(key);
            }
        }

        return arr;
    },

    get_raw_html(url, callback) {
        got(url).then(response => {
            return callback(response.body);
        }).catch(err => {
            console.log(err);
        });
    },

    newest_xkcd(callback) {
        module.exports.get_raw_html("https://www.xkcd.com", function ($) {
            return callback($.split("Permanent link to this comic: https://xkcd.com/")[1].split("/")[0]);
        })
    },

    count(arr, substr) {
        let count = 0;
        for(let i = 0; i < arr.length; ++i){
            if(arr[i] == substr)
                count++;
        }

        return count;
    },

    count_2d(arr, substr) {
        let full_count = 0;

        for(let j=0;j<arr.length;j++) {
            full_count += module.exports.count(arr[j], substr);
        }

        return full_count;
    },

    async run(cmd) {
        let e = await exec(cmd);
        console.log(e);
        return e.stdout.trim();
    },

    ip() {
        return Object.values(require('os').networkInterfaces()).reduce((r, list) => r.concat(list.reduce((rr, i) => rr.concat(i.family==='IPv4' && !i.internal && i.address || []), [])), []); //https://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
    },

    split_arr(arr, count) {
        completed = [];

        row = [];
        num = 0;

        for(i in arr) {

            row.push(arr[i]);
            num ++;

            if(num == count || i == arr.length-1) {
                num = 0;
                completed.push(row);
                row = [];
            }
        }

        return completed;
    },

    seconds_to_time(seconds) {
        minutes = Math.floor(seconds/60);
        seconds -= (minutes*60);

        hours = Math.floor(minutes/60);
        minutes -= (hours*60);

        return [module.exports.format_time(hours), module.exports.format_time(minutes), module.exports.format_time(seconds)].join(":");
    },

    to_title_case(str) {
        return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
        );
    },
    
    get_filtered_items(tag, realm) {
        let valid_items = [];
    
        for(let key in items) {
            if(Object.keys(items[key]).includes(tag)) {
                for(let i=0;i<items[key][tag][realm];i++) {
                    valid_items.push(key);
                }
            }
        }
    
        return valid_items;
    },

    is_num(val) {
        return /^\d+$/.test(val);
    },
    
    get_random_int(max) {
        return Math.floor(Math.random() * Math.floor(max));
    },
    
    dict_to_pretty(row_d) {
        let better_row = []
    
        for(let s=0;s<Object.keys(row_d).length;s++) {
    
            values = Object.values(row_d);
            keys = Object.keys(row_d);
    
            better_row.push("`"+values[s]+"x` "+keys[s]);
        }
    
        return better_row;
    },
    
    get_prettified_items(selected_items) {
    
        let row = {};
    
        for(let q=0;q<selected_items.length;q++) {
            let with_emoji = items[selected_items[q]].emoji+" "+module.exports.to_title_case(selected_items[q]);
    
            if(Object.keys(row).includes(with_emoji)) {row[with_emoji] ++;}
            else {row[with_emoji] = 1;}
        }
    
        return module.exports.dict_to_pretty(row);
    },
    
    format_time(time) { // Turning '6' to '06'
        time = JSON.stringify(time);
        time = "0".repeat(2-time.length)+time;
        return time;
    },
    
    log(text, color, self) { // Printing "[h:m:s] text"
        if(debug.PRINT) {
            let end = "";
            if(color==undefined) {
                color = "";
            }
            else {
                try {
                    end = module.exports.colors.reset;
                }
                catch {
                    end = module.exports.colors.reset;
                }
            }
        
            let date = new Date();
        
            console.log("["+module.exports.format_time(date.getHours())+":"+module.exports.format_time(date.getMinutes())+":"+module.exports.format_time(date.getSeconds())+"] "+color+text+end);
        }
    },

    get_difference(a, b) // https://stackoverflow.com/questions/57102484/find-difference-between-two-strings-in-javascript
    {
        var i = 0;
        var j = 0;
        var result = "";

        while (j < b.length)
        {
         if (a[i] != b[j] || i == a.length)
             result += b[j];
         else
             i++;
         j++;
        }
        return result;
    },
    
    header(text) { // Nice, fancy header
        console.log()
        module.exports.log(text.toUpperCase(), module.exports.colors.blue);
    },
    
    define(path) { // Loading JSON data from path
        let t = JSON.parse(fs.readFileSync(path));
        return t;
    },
    
    define_script(path, client) {
        const command = require(`./${path}`);
    
        // set a new item in the Collection
        // with the key as the command name and the value as the exported module
        client.commands.set(command.name, command);
        
        module.exports.log('Imported '+command.name, module.exports.colors.green);

        return [command.name, command.usage];
    },
}

module.exports.colors = colors;