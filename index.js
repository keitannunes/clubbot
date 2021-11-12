const fs = require("fs");
const { Client, Intents } = require('discord.js'); //stole from stackoverflow can't use const discord = require("discord.js"); anymore :(
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }); //??????????
const axios = require("axios");
const { MessageEmbed } = require('discord.js');
require('dotenv').config();
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
console.clear()
console.log("Loading... Please wait");

const error1 = setTimeout(function () {
    console.log("\x1b[41m", "ERROR: UNABLE TO CONNECT TO DISCORD SERVER");
}, 10000);
client.on("ready", () => {
    clearTimeout(error1);
    console.log(`Logged into ${client.guilds.cache.size} guilds`)
    console.log("");
    console.log("Log:");
    console.log("");
    client.user.setActivity(fs.readFileSync("views/game.txt", "utf8"));
});

const balance = supabase
    .from('balance')
    .on('INSERT', payload => {
        console.log('Change received!', payload)
    })
    .on('DELETE', payload => {
        console.log('Change received!', payload)
    })
    .subscribe()
//functions

client.on("messageCreate", async message => {
    const messageLower = message.content.toLowerCase();
    const args = message.content
        .slice(process.env.PREFIX.length)
        .trim()
        .split(/ +/g);
    const command = args.shift().toLowerCase();
    if (message.author.bot) return; //if message author is a bot
    if (message.author.id != "239400603346796544" && message.author.id != "296785190792069120") return; //message not sent by me
    if (message.content.indexOf(process.env.PREFIX) !== 0) return; //message doesn't have prefix
    const output = await message.channel.send("Thinking..."); //message that'll be edited later
    const mention = message.mentions.users.first();
    switch (command) {
        case "ping": {
            output.edit(
                `Pong! Latency is ${output.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`
            );
        }
            break;

        case "balance": {
            if (mention) {
                let { data, err } = await supabase
                    .from('balance')
                    .select('value')
                    .eq('id', mention.id)

                if (err) {
                    console.log(err)
                    output.edit(output.edit("There was an error processing your request"))
                }
                console.log(data)
                if (typeof data[0] !== "undefined") {
                    output.edit(String(data[0].value))
                } else {
                    output.edit("This user has not signed up yet")
                }
            } else {
                let { data, err } = await supabase
                    .from('balance')
                    .select('value')
                    .eq('id', message.author.id)

                if (err) {
                    console.log(err)
                    output.edit(output.edit("There was an error processing your request"))
                }
                if (typeof data[0] !== "undefined") {
                    output.edit(String(data[0].value))
                } else {
                    output.edit("You have not signed up yet")
                }
            }
        }
            break;

        case "signup": {
            let { data } = await supabase
                .from('balance')
                .select('id')
                .eq('id', message.author.id)
            if (typeof data[0] == "undefined") { //check if new person is not already in the database
                await supabase
                    .from('balance')
                    .insert([
                        { id: message.author.id, username: message.author.username },
                    ])
                output.edit("Signed up!")
            } else {
                output.edit("You have already signed up!")
            }
        }
            break;

        case "setbalance": {
            if (!mention) {
                output.edit("Please mention someone")
                break; 
            }
            await supabase
                .from('balance')
                .update({ value: args[1] })
                .eq('id', mention.id)
            output.edit(`Set ${mention.username}'s balance to ${args[1]}`)
        }
            break;

        case "delete": {
            if (!mention) {
                output.edit("Please mention someone")
                break; 
            }
            output.edit(`Please type "yes" to confirm deleting ${mention.username}'s data'`)
            const filter = (m) => { //define filter 
                return m.author.id === message.author.id
              };
            const collector = message.channel.createMessageCollector(filter, { time: 30000, max: 1 }); // declare collector with max wait time 15 sec and 1 reply
            collector.on('collect', async m => {//runs when collected something
                if (m.content == "yes"){
                    const { data } = await supabase
                    .from('balance')
                    .delete()
                    .eq('id', mention.id)
                    output.edit(`deleted ${mention.username}'s data'`)
                } else {
                    output.edit("Failed to delete: Confirmation failed");
                }
            })
            collector.on('end', collected => { //runs when collector stops collecting
            if (collected.size === 0){
                output.edit("Collector expired")
            }
            });
        }
            break
        default:
            output.edit("That's not a command!")
    }
});
client.login(process.env.DISCORD_TOKEN);
