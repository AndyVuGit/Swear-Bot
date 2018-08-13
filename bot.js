var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var fs = require('fs');

let swearJar = JSON.parse(fs.readFileSync("./change.json", "utf8"));
var current = +swearJar.change;

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        switch(cmd) {
            // add to the jar
            case 'add':
                current += .25;
                bot.sendMessage({
                    to: channelID,
                    message: user + 'has added to the jar. Current change in the jar: $' + current
                });
                swearJar.change = current;
                var name = user;
                if (swearJar[name] == null)
                {
                  swearJar[name] = .25;
                }
                else {
                  swearJar[name] += .25;
                }

                fs.writeFile("./change.json", JSON.stringify(swearJar), (err) => {
                  if (err) console.error(err)
                });
            break;
            // clear the jar
            case 'clear':
              current = 0;
              bot.sendMessage({
                  to: channelID,
                  message: 'Emptying the jar.'
              });
              var obj = {"change" : 0};

              fs.writeFile("./change.json", JSON.stringify(obj), (err) => {
                if (err) console.error(err)
              });
            break;
            // help
            case 'help':
              bot.sendMessage({
                to: channelID,
                message: 'These are the available commands.\n' + '!add : adds 25 cent ot the current jar.\n' + '!clear: clears the current jar.'
              });
            case 'total':
              bot.sendMessage({
                  to: channelID,
                  message: JSON.stringify(swearJar, null, "\t")
              });
         }
     }
});
