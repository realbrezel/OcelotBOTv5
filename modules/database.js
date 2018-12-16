/**
 * Created by Peter on 07/06/2017.
 */

/**
 * A Discord Snowflake
 * @typedef {String|Object} Snowflake
 */

/**
 * A Discord User
 * @typedef {Snowflake} UserID
 */

/**
 * A Discord Guild
 * @typedef {Snowflake} ServerID
 */

/**
 * A Discord Channel
 * @typedef {Snowflake} ChannelID
 */

const config = require('config');
const pasync = require('promise-async');
var knex = require('knex')(config.get("Database"));
module.exports = {
        name: "Database Module",
        enabled: true,
        init: function init(bot) {

        const SERVERS_TABLE = "ocelotbot_servers";
        const PETERMON_TABLE = "pm_status";
        const MEMES_TABLE = "ocelotbot_memes";
        const REMINDERS_TABLE = "ocelotbot_reminders";
        const TRIVIA_TABLE = "trivia";
        const COMMANDLOG_TABLE = "commandlog";
        const BANS_TABLE = "bans";
        const LEFTSERVERS_TABLE = "ocelotbot_leftservers";
        const LANG_TABLE = "ocelotbot_languages";
        const LANG_KEYS_TABLE = "ocelotbot_language_keys";
        const SPOOK_TABLE = "ocelotbot_spooks";
        const PROFILE_TABLE = "ocelotbot_profile";
        const SERVER_SETTINGS_TABLE = "ocelotbot_server_settings";
        const BADGES_TABLE = "ocelotbot_badges";


 
        bot.database = {
            /**
             * Add a server to the database
             * @param {ServerID} serverID The server's Snowflake ID
             * @param {UserID} addedBy The server owner's Snowflake ID
             * @param {String} name The name of the server
             * @param {Number} [timestamp] The Unix Timestamp in milliseconds
             * @param {String} lang Language
             * @returns {Promise<Array>}
             */
            addServer: function addNewServer(serverID, addedBy, name, timestamp, lang = "en-gb") {
                return knex.insert({
                    server: serverID,
                    owner: addedBy,
                    name: name,
                    prefix: "!",
                    timestamp: knex.raw(`FROM_UNIXTIME(${(timestamp ? new Date(timestamp).getTime() : new Date().getTime()) / 1000})`),
                    language: lang
                }).into(SERVERS_TABLE);
            },
            /**
             * Remove a server from the database
             * This generally shouldn't be used in favour of `bot.database.leaveServer`
             * @param {ServerID} serverID The server's Snowflake ID
             * @returns {Promise<Array>}
             */
            deleteServer: function deleteServer(serverID) {
                return knex.delete()
                    .from(SERVERS_TABLE)
                    .where({
                        server: serverID
                    });
            },
            /**
             * Mark a server as left
             * @param {ServerID} serverID The server's Snowflake ID
             * @returns {Promise<Array>}
             */
            leaveServer: function leaveServer(serverID) {
                return knex.insert({
                    server: serverID
                })
                    .into(LEFTSERVERS_TABLE);
            },
            /**
             * Get a server's data from it's ID
             * @param {ServerID} serverID The server's Snowflake ID
             * * @returns {Promise<Array>}
             */
            getServer: function getServer(serverID) {
                return knex.select().from(SERVERS_TABLE).where({server: serverID}).limit(1);
            },
            /**
             * Set a server's bot settings
             * @param {ServerID} server The server's Snowflake ID
             * @param {String} setting The setting key
             * @param {String|Number} value
             * * @returns {Promise<Array>}
             */
            setServerSetting: function setServerSetting(server, setting, value) {
                return knex(SERVERS_TABLE).update(setting, value).where({server: server}).limit(1);
            },
            /**
             * Get the language key for the server specified
             * @param {ServerID} server The server's Snowflake ID
             * @returns {Promise<Array>}
             */
            getServerLanguage: function getServerCurrency(server) {
                return knex.select("language").from(SERVERS_TABLE).where({server: server}).limit(1);
            },
            /**
             * Get all servers and their set languages
             * @returns {Promise<Array>}
             */
            getLanguages: function getLanguages() {
                return knex.select("server", "language").from(SERVERS_TABLE);
            },
            /**
             * Get all past and present servers
             * @returns {Promise<Array>}
             */
            getServers: function getServers() {
                return knex.select().from(SERVERS_TABLE);
            },
            /**
             * Gets all servers with a particular setting enabled
             * @param {String} setting The setting key
             * @returns {Promise<Array>}
             */
            getServersWithSetting: function getServersWithSetting(setting) {
                return knex.select().from(SERVERS_TABLE).whereNotNull(setting).andWhereNot(setting, 0);
            },
            /**
             * Gets an array of servers and their set prefix
             * @returns {Promise<Array>}
             */
            getPrefixes: function getPrefixes() {
                return knex.select("server", "prefix").from(SERVERS_TABLE);
            },
            /**
             * Gets the last sent data from the petermon database
             * @deprecated
             */
            getLastPetermonData: function getLastPetermonData() {
                return knex.select().from(PETERMON_TABLE).orderBy("timestamp", "DESC").limit(1);
            },
            /**
             * Gets the last time peter's state was set to being somewhere other than at home or asleep
             * @deprecated
             */
            getPetermonLastOutside: function getPetermonLastOutside() {
                return knex.select("timestamp")
                    .from(PETERMON_TABLE)
                    .where({state: 'Outside'})
                    .orWhere({state: 'Abbeys'})
                    .orderBy("timestamp", "DESC")
                    .limit(1);
            },
            /**
             * Gets a list of all memes available to a particular server
             * @param {ServerID} server The server's Snowflake ID
             * @returns {Promise<Array>}
             */
            getMemes: function getMemes(server) {
                return knex.select("name", "server").from(MEMES_TABLE).where({server: server}).orWhere({server: "global"});
            },
            /**
             * Gets the names of all memes in the database
             * @returns {Promise<Array>}
             */
            getAllMemes: function getAllMemes() {
                return knex.select("name").from(MEMES_TABLE);
            },
            /**
             * Remove a meme from the database
             * @param {String} meme The meme's name
             * @param {ServerID} server The server ID
             * @param {UserID} user The user ID who added the meme
             * @returns {string}
             */
            removeMeme: function removeMeme(meme, server, user) {
                return knex.raw(knex.delete().from(MEMES_TABLE).where({
                    name: meme,
                    addedby: user
                }).whereIn("server", [server, "global"]).toString() + " LIMIT 1");
            },
            /**
             * Add a meme to the database
             * @param {UserID} user
             * @param {ServerID} server
             * @param {String} name The meme name
             * @param {String} content The meme content
             * @returns {*}
             */
            addMeme: function addMeme(user, server, name, content) {
                return knex.insert({
                    name: name,
                    addedby: user,
                    server: server,
                    meme: content
                }).into(MEMES_TABLE);
            },
            /**
             * Get a meme by name and server
             * @param {String} meme The meme name
             * @param {ServerID} server The server ID
             * @returns {*}
             */
            getMeme: function getMeme(meme, server) {
                return knex.select("meme").from(MEMES_TABLE).where({name: meme}).whereIn("server", [server, "global"]).orderBy("server");
            },
            /**
             * Get a meme regardless of whether or not it belongs to the current serve
             * @param {String} meme The meme name
             * @returns {*}
             */
            forceGetMeme: function forceGetMeme(meme) {
                return knex.select("meme", "server").from(MEMES_TABLE).where({name: meme});
            },
            /**
             * Add a reminder
             * @param {String} receiver "discord", deprecated field from cross platform support
             * @param {UserID} user The User ID
             * @param {ServerID} server The server ID
             * @param {ChannelID} channel The channel ID
             * @param {Number} at The unix timestamp in milliseconds to trigger the reminder
             * @param {String} message The reminder message
             * @returns {*}
             */
            addReminder: function addReminder(receiver, user, server, channel, at, message) {
                return knex.insert({
                    receiver: receiver,
                    user: user,
                    server: server,
                    channel: channel,
                    at: knex.raw(`FROM_UNIXTIME(${at / 1000})`),
                    message: message
                }).into(REMINDERS_TABLE);
            },
            /**
             * Gets all reminders
             * @returns {Promise<Array>}
             */
            getReminders: function getReminders() {
                return knex.select().from(REMINDERS_TABLE);
            },
            /**
             * Remove a reminder
             * @param {String} id
             * @returns {*}
             */
            removeReminder: function removeReminder(id) {
                return knex.delete().from(REMINDERS_TABLE).where({id: id});
            },
            /**
             * Gets the all time trivia leaderboard
             * @returns {*}
             */
            getTriviaLeaderboard: function getTriviaLeaderboard() {
                return knex.select("user", knex.raw("SUM(difficulty) as 'Score'"), knex.raw("COUNT(*) as 'correct'"))
                    .from(TRIVIA_TABLE)
                    .where("correct", 1)
                    .orderBy("Score", "DESC")
                    .groupBy("user");
            },
            /**
             * Gets the monthly trivia leaderboard
             * @returns {*}
             */
            getMonthlyTriviaLeaderboard: function getMonthlyTriviaLeaderboard() {
                return knex.select("user", knex.raw("SUM(difficulty) as 'Score'"), knex.raw("COUNT(*) as 'correct'"))
                    .from(TRIVIA_TABLE)
                    .where("correct", 1)
                    .andWhereRaw("MONTH(timestamp) = MONTH(CURRENT_TIMESTAMP)")
                    .orderBy("Score", "DESC")
                    .groupBy("user");
            },
            /**
             * Logs a trivia event
             * @param {UserID} user The user ID
             * @param {Boolean} correct If the user got the answer correct
             * @param {Number} difficulty The trivia service supplied difficulty
             * @param {ServerID} server The server ID
             * @returns {*}
             */
            logTrivia: function logTrivia(user, correct, difficulty, server) {
                return knex.insert({
                    user: user,
                    correct: correct,
                    difficulty: difficulty,
                    server: server
                }).into(TRIVIA_TABLE);
            },
            /**
             * Log a command
             * @param {UserID} user The user ID
             * @param {ChannelID} channel The channel ID
             * @param {String} command The full message content
             * @returns {*}
             */
            logCommand: function logCommand(user, channel, command) {
                return knex.insert({
                    userID: user,
                    channelID: channel,
                    command: command,
                    server: "ocelotbot-" + bot.client.shard ? bot.client.shard.id : "0"
                }).into(COMMANDLOG_TABLE);
            },
            /**
             * Ban a user
             * @param {Snowflake} id The banned user/server/channel ID
             * @param {String} type "server"/"user"/"channel"
             * @param {String} reason The reason
             * @returns {*}
             */
            ban: function ban(id, type, reason) {
                return knex.insert({
                    id: id,
                    type: type,
                    reason: reason
                }).into(BANS_TABLE);
            },
            /**
             * Get all banned users
             * @returns {Array|*}
             */
            getBans: function () {
                return knex.select().from(BANS_TABLE);
            },
            /**
             * Get most used commands, through a very slow database query
             */
            getCommandStats: function () {
                return knex.select(knex.raw("SUBSTRING_INDEX(SUBSTRING_INDEX(command, ' ',  1), ' ', -1) as commandName"), knex.raw("COUNT(*) as count"))
                    .from(COMMANDLOG_TABLE)
                    .whereRaw("command LIKE '!%'")
                    .andWhereRaw("server NOT LIKE 'ethanbot-%'")
                    .orderBy("count", "DESC")
                    .groupBy("commandName")
                    .limit(5);
            },
            /**
             * Get the count of commands by a particular user
             * @param {UserID} user
             * @returns {*}
             */
            getUserStats: function (user) {
                return knex.select(knex.raw("COUNT(*) AS commandCount")).from(COMMANDLOG_TABLE).where({userID: user})
            },
            /**
             * Get a random topic for Ocelotworks
             */
            getRandomTopic: function(){
                return knex.select().from("Topics").where({naughty: 0}).orderBy(knex.raw("RAND()")).limit(1);
            },
            /**
             * Add a topic
             * @param {String} user The user name NOT ID
             * @param {String} message The message
             * @returns {*}
             */
            addTopic: function(user, message){
                return knex.insert({
                    username: user,
                    topic: message,
                    naughty: 0
                }).into("Topics");
            },
            /**
             * Remove a topic
             * @param {Number} id The topic ID
             */
            removeTopic: function(id){
                return knex.delete().from("Topics").where({id: id}).limit(1);
            },
            /**
             * Get a topic ID from it's contnet
             * @param {String} user The user's name
             * @param {String} message The message
             * @returns {*}
             */
            getTopicID: function(user, message){
                return knex.select(id).from("Topics").where({username: user, topic: message})
            },
            /**
             * Get stats of topic per user
             * @returns {*}
             */
            getTopicStats: function(){
                return knex.select(knex.raw("username, COUNT(*)")).from("Topics").orderByRaw("COUNT(*) DESC").groupBy("username");
            },
            /**
             * Log an Ocleotworks message
             * @param {String} user
             * @param {String} message
             * @param {ChannelID} channel
             * @returns {*}
             */
            logMessage: function(user, message, channel){
                return knex.insert({
                    user: user,
                    message: message,
                    channel: channel,
                    time: new Date().getTime()
                }).into("Messages");
            },
            /**
             * Generates a "roses are red" poem
             */
            getRandomRosesPoem: function(){
                return knex.select("message","user","time")
                    .from("Messages")
                    .whereRaw('message REGEXP ".*([to]o|u|[uei]w|2)$" AND (LENGTH(message) - LENGTH(REPLACE(message, " ", ""))) > 5')
                    .orderByRaw("RAND()")
                    .limit(1);
            },
            /**
             * Get all messages by a particular user
             * @param {String} target The users name
             * @returns {Array|*}
             */
            getMessages: function(target){
                let query = knex.select().from("Messages");
                if(target)query = query.where({user: target});
                return query;
            },
            /**
             * Get a message ID from the content
             * @param {String} user
             * @param {String} message
             * @returns {*}
             */
            getMessageID: function(user, message){
                return knex.select("id").from("Messages").where({message: message, user: user});
            },
            /**
             * Get the messages surrounding a particular message ID
             * @param {Number} id
             * @returns {*}
             */
            getMessageContext: function(id) {
                return knex.select().from("Messages").whereBetween("id", [id - 5, id + 5]);
            },
            /**
             * Get all messages with a particular date
             * @param {Number} day
             * @param {Number} month
             * @returns {*}
             */
            getOnThisDayMessages: function(day,month){
                return knex.select().from("Messages").whereRaw("DAY(FROM_UNIXTIME(time/1000)) = "+day).andWhereRaw("MONTH(FROM_UNIXTIME(time/1000)) = "+month).orderBy("time", "ASC");
            },
            /**
             * Gets a random message containing a particular phrase
             * @param {String} phrase
             * @returns {*}
             */
            getMessageContaining: function(phrase){
                return knex.select().from("Messages").where("message", "like", `%${phrase}%`).limit(1).orderbyRaw("RAND()");
            },
            /**
             * Gets a random message from a user containing a phrase
             * @param {String} [user]
             * @param {String} [phrase]
             * @returns {*}
             */
            getMessageFrom: function(user, phrase){
                var query = knex.select().from("Messages").limit(1).orderByRaw("RAND()");
                if(user)
                    query = query.andWhere("user", user);
                if(phrase)
                    query = query.andWhere("message", "like", `%${phrase}%`);
                return query;
            },
            /**
             * Gets the database stats
             * @returns {Promise.<{servers: Number, leftServers: Number, memes: Number, reminders: Number, commands: Number}>}
             */
            getDatabaseStats: async function(){
                const serverCount = await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_servers");
                const leftServerCount = await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_leftservers");
                const memeCount = await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_memes");
                const reminderCount = await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_reminders");
                const commandCount = await knex.select(knex.raw("COUNT(*)")).from("commandlog");
                return {
                    servers: serverCount[0]['COUNT(*)'],
                    leftServers: leftServerCount[0]['COUNT(*)'],
                    memes: memeCount[0]['COUNT(*)'],
                    reminders: reminderCount[0]['COUNT(*)'],
                    commands: commandCount[0]['COUNT(*)']
                }
            },
            /**
             * Checks if a user can spook smeone
             * @param {UserID} user
             * @param {ServerID} server
             * @returns {Promise.<boolean>}
             */
            canSpook: async function canSpook(user, server){
                const result = await bot.database.getSpooked(server);
                if(!result[0])
                     bot.logger.log(`${user} can spook because there have been no spooks.`);
                else if(result[0].spooked !== user)
                    bot.logger.log(`${user} can't spook ${result[0].spooked} is spooked not ${user}`);

                return !result[0] || result[0].spooked === user;
            },
            /**
             * Spook someone
             * @param {UserID} user The user who was spooked
             * @param {UserID} spooker The user who did the spooking
             * @param {ServerID} server The server where the spook happened
             * @param {String} spookerUsername The spooker's username
             * @param {String} spookedUsername
             * @returns {*}
             */
            spook: function(user, spooker, server, spookerUsername, spookedUsername){
                return knex.insert({
                    spooker: spooker,
                    spooked: user,
                    server: server,
                    spookerUsername: spookerUsername,
                    spookedUsername: spookedUsername
                }).into("ocelotbot_spooks");
            },
            /**
             * Get the person who is currently spooked
             * @param {ServerID} [server]
             * @returns {*}
             */
            getSpooked: function(server){
                if(!server) {
                    return knex.select().from("ocelotbot_spooks").orderBy("timestamp", "desc");
                }
                return knex.select().from("ocelotbot_spooks").where({server: server}).orderBy("timestamp", "desc").limit(1);
            },
            /**
             * Gets spooked server stats
             * @returns {Promise.<{servers: Number, total: Number}>}
             */
            getSpookedServers: async function(){
                return{
                    servers: await knex.select("server", knex.raw("COUNT(*)")).from("ocelotbot_spooks").groupBy("server"),
                    total: await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_spooks")
                }
            },
            /**
             * Gets all servers that have participated in the spooking
             * @returns {Array|*}
             */
            getParticipatingServers: function(){
                return knex.select().distinct("server").from("ocelotbot_spooks");
            },
            /**
             * Gets all users that have participated in the spooking
             * @returns {Array|*}
             */
            getParticipatingUsers: function(){
                return knex.select().distinct("spooker", "spooked").from("ocelotbot_spooks");
            },
            /**
             * Gets all spooks where there is a username missing
             * @returns {*}
             */
            getDirtySpooks: function(){
                return knex.select().from("ocelotbot_spooks").whereNull("spookerUsername").orWhereNull("spookedUsername");
            },
            /**
             * Update a spook
             * @param {Number} id The spook ID
             * @param {Object} spook
             * @param {String} [spook.spookerUsername]
             * @param {String} [spook.spookedUsername]
             * @param {UserID} [spook.spooker]
             * @param {UserID} [spook.spooked]
             * @param {ServerID} [spook.server]
             */
            updateSpook: function(id, spook){
                return knex("ocelotbot_spooks").update(spook).where({id: id}).limit(1);
            },
            /**
             * Get the total times a user has been spooked in a particular server
             * @param {UserID} user
             * @param {ServerID} server
             * @returns {*}
             */
            getSpookCount: function(user, server) {
                return knex.select(knex.raw("COUNT(*)")).from("ocelotbot_spooks").where({server: server, spooked: user});
            },
            /**
             * Get the end spook stats
             * @param {ServerID} server
             * @returns {Promise.<{mostSpooked: Object<{spooked: UserID, COUNT(*): Number}>, totalSpooks: Number, longestSpook: Object<{spooked: {UserID}, diff: Number}>}>}
             */
            getSpookStats: async function(server){
                return {
                    mostSpooked: (await knex.select("spooked", knex.raw("COUNT(*)")).from("ocelotbot_spooks").where({server: server}).groupBy("spooked").orderByRaw("COUNT(*) DESC").limit(1))[0],
                    totalSpooks: (await knex.select(knex.raw("COUNT(*)")).from("ocelotbot_spooks").where({server: server}))[0]['COUNT(*)'],
                    //I'm sorry papa
                    longestSpook: (await knex.select("spooked", knex.raw("TIMESTAMPDIFF(SECOND, timestamp, (SELECT timestamp FROM ocelotbot_spooks AS spooks3 WHERE id = (SELECT min(id) FROM ocelotbot_spooks AS spooks2 WHERE spooks2.id > ocelotbot_spooks.id AND spooks2.server = ocelotbot_spooks.server))) as diff")).from("ocelotbot_spooks").where({server: server}).orderBy("diff", "DESC").limit(1))[0]
                }
            },
            getProfile: function(user){
                return knex.select().from("ocelotbot_profile").where({id: user}).limit(1);
            },
            createProfile: async function(user){
                return knex.insert({id: user, firstSeen: (await bot.database.getFirstSeen(user))[0]['MIN(timestamp)']}).into("ocelotbot_profile");
            },
            getProfileBadges: function(user){
                return knex.select().from("ocelotbot_badge_assignments").where({user: user}).innerJoin(BADGES_TABLE, "ocelotbot_badges.id", "ocelotbot_badge_assignments.badge").orderBy("ocelotbot_badge_assignments.order", "ASC");
            },
            getBadgeTypes: function(){
                return knex.select().from(BADGES_TABLE).orderBy("order");
            },
            setProfileTagline: function(user, tagline){
                return knex("ocelotbot_profile").update({caption: tagline}).where({id: user}).limit(1);
            },
            giveBadge: function(user, badge){
                return knex.insert({user: user, badge: badge}).into("ocelotbot_badge_assignments");
            },
            hasBadge: async function(user, badge){
                return (await knex.select().from("ocelotbot_badge_assignments").where({user: user, badge: badge}).limit(1)).length > 0
            },
            removeBadge: function(user, badge){
                return knex.delete().from("ocelotbot_badge_assignments").where({user: user, badge: badge}).limit(1);
            },
            getFirstSeen: function(user){
                return knex.select(knex.raw("MIN(timestamp)")).from(COMMANDLOG_TABLE).where({userID: user})
            },
            addSubscription: function(server, channel, user, type, url){
                return knex.insert({
                    server: server,
                    channel: channel,
                    user: user,
                    type: type,
                    data: url
                }).into("ocelotbot_subscriptions");
            },
            getSubscriptionsForChannel: function(channel){
                return knex.select().from("ocelotbot_subscriptions").where({
                    channel: channel
                });
            },
            getAllSubscriptions: function(){
                return knex.select().from("ocelotbot_subscriptions");
            },
            updateLastCheck: function(server, channel, type, url){
                return knex("ocelotbot_subscriptions").update({lastcheck: new Date()}).where({server: server, channel: channel, type: type, data: url}).limit(1);
            },
            removeSubscription: function(server, channel, id){
                return knex("ocelotbot_subscriptions").delete().where({
                    server: server,
                    channel: channel,
                    id: id
                }).limit(1);
            },
            addLangKey: function(lang, key, message){
                return knex.insert({
                    lang: lang,
                    key: key,
                    message: message
                }).into(LANG_KEYS_TABLE);
            },
            getLanguageList: function(){
                return knex.select().from(LANG_TABLE);
            },
            getAllLanguageKeys: function(){
                return knex.select().from(LANG_KEYS_TABLE);
            },
            getLanguageKeys: function(lang){
                return knex.select().from(LANG_KEYS_TABLE).where({lang: lang});
            },
            getLanguagesForShard: function(guilds){
                return knex.select("server", "language").from(SERVERS_TABLE).whereIn("server", guilds);
            },
            getServerSetting: function(server, property){
                return knex.select().from(SERVER_SETTINGS_TABLE).where({server: server, setting: property}).orWhere({"server": "global", setting: property}).orderBy("server").limit(1);
            },
            getServerSettings: function(server){
                return knex.select().from(SERVER_SETTINGS_TABLE).where("server", server);
            },
            getSettingsForShard: function(guilds){
                return knex.select().from(SERVER_SETTINGS_TABLE).whereIn("server", guilds);
            },
            getGlobalSettings: function(){
                return knex.select().from(SERVER_SETTINGS_TABLE).where("server", "global");
            },
            setSetting: async function(server, setting, value){
                let currentKey = await knex.select().from(SERVER_SETTINGS_TABLE).where({server, setting}).limit(1);
                if(currentKey.length > 0)
                    return knex(SERVER_SETTINGS_TABLE).update({setting, value}).where({server, setting}).limit(1);
                return knex.insert({server, setting, value}).into(SERVER_SETTINGS_TABLE);
            },
            deleteSetting: function(server, setting){
                return knex.delete().from(SERVER_SETTINGS_TABLE).where({server,setting}).limit(1);
            },
            addSongGuess: async function(user, channel, server, guess, song, correct, elapsed){
                await knex.insert({user, channel, server, guess,song, correct, elapsed}).into("ocelotbot_song_guess");
            }
        };
    }
};