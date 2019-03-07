
const Discord = require('discord.js');
const util = require('util');
const request = util.promisify(require('request'));
//Reddit API
module.exports = {
    name: "Reddit",
    id: "reddit",
    alias: ["subreddit"],
    validate: function(input){
        if(input.startsWith("r/"))
            return null;
        return ":warning: Subreddits should be in the following format: r/name e.g: **r/discord_irl** or **r/aww/new**";
    },
    check: async function check(sub, lastCheck){
        let {err, resp, body} = await request(`https://json.reddit.com/${sub}`);
        if(err){
            console.error("Error checking sub "+sub);
            console.error(err);
            return;
        }
        let output = [];
        try{
            let data = JSON.parse(body);
            if(data.data){
                for(let i = 0; i < data.data.children.length; i++){
                    let post = data.data.children[i].data;
                    if(post.created_utc*1000 > lastCheck){
                        let embed = new Discord.RichEmbed();
                        embed.setTitle(post.title);
                        embed.setAuthor(post.author);
                        embed.setURL(`https://reddit.com${post.permalink}`);
                        embed.setFooter(`${post.ups} points on ${post.subreddit}`);
                        embed.setTimestamp(new Date(post.created_utc*1000));
                        if(post.selftext)
                            embed.setDescription(post.selftext);

                        if(post.preview && post.preview.images && post.preview.images[0] && post.preview.images[0].source) {
                            console.log("Setting preview image");
                            //Why do you do this, reddit?
                            embed.setImage(post.preview.images[0].source.url.replace(/&amp;/g, "&"));
                        }else if(post.url.indexOf("imgur") > -1) {
                            console.log("Setting post url");
                            embed.setImage(post.url);
                        }else if(post.thumbnail) {
                            console.log("Setting thumbnail");
                            embed.setThumbnail(post.thumbnail);
                        }else{
                            console.log("dick all");
                        }

                        output.push(embed);
                    }
                }
            }
        }catch(e){
            console.error("Error checking sub "+sub);
            console.error(e);
            return null;
        }
        return output;
    },
    added: function added(sub){

    }
};