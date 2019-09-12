/**
 *   ╔════   Copyright 2019 Peter Maguire
 *  ║ ════╗  Created 12/09/2019
 * ╚════ ║   (ocelotbotv5) tasks
 *  ════╝
 */
module.exports = {
    name: "Task Manager",
    init: function(bot){
       bot.tasks = {};

       bot.tasks.running = [];

       bot.tasks.startTask = function startTask(name, id){
           if(bot.tasks.hasTask(name, id))
               return bot.logger.warn(`Task ${name} ${id} already exists!`);
            bot.tasks.running.push(name+id);
            bot.logger.info(`Started task ${name} (${id})`);

            if(bot.tasks.running.length === 1)
                bot.client.shard.send({type: "tasksClear", payload: false});
       };


       bot.tasks.hasTask = function hasTask(name, id){
         return bot.tasks.getTaskIndex(name, id) > -1;
       };

       bot.tasks.getTaskIndex = function getTaskIndex(name, id){
           return bot.tasks.running.indexOf(name+id);
       };

       bot.tasks.endTask = function endTask(name, id){
           const index = bot.tasks.getTaskIndex(name, id);
           if(index === -1)
               return bot.logger.warn(`Task ${name} ${id} doesn't exist!`);
            bot.logger.info(`Ended task ${name} (${id})`);
            bot.tasks.running.splice(index, 1);
            if(bot.tasks.running.length === 0)
                bot.client.shard.send({type: "tasksClear", payload: true});
       };
    }
};