/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 04/09/2019
 * ╚════ ║   (ocelotbotv5) queue
 *  ════╝
 */
module.exports = {
    name: "Clear Queue",
    usage: "clearqueue",
    commands: ["clear", "cq", "clearqueue", "qc"],
    run: async function(message, args, bot, music){
        const guild = message.guild.id;
        if(!music.listeners[guild] || !music.listeners[guild].playing)
            return message.replyLang("MUSIC_NOTHING_PLAYING");

        const listener = music.listeners[guild];

        if(listener.queue.length === 0)
            return message.replyLang("MUSIC_QUEUE_EMPTY");


        if(listener.voiceChannel.members.size > 2 )
            return message.channel.send(`:bangbang: You can only use this command if you're the only one listening.`);

        message.channel.send(`:white_check_mark: Cleared **${listener.queue.length}** items from the queue.`);
        listener.queue = [];
        await bot.database.clearQueue(listener.id);
    }
};