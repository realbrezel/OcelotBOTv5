/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 07/12/2018
 * ╚════ ║   (ocelotbotv5) setConfig
 *  ════╝
 */
module.exports = {
    name: "Set Config Key",
    usage: "setconfig server key value",
    commands: ["setconfig"],
    run: async function(message, args, bot){
        const server = args[2];
        const key = args[3];
        const value = message.content.substring(message.content.indexOf(args[4]));
        if(!server || !key){
            message.channel.send("Invalid usage. !admin setconfig server key value");
        }else{
            await bot.database.setSetting(server, key, value);
            await bot.config.reloadCacheForServer(server);
            message.channel.send("Set setting and reloaded cache.");
        }
    }
};