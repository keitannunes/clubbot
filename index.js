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
function rng(min, max) {
    return Math.round(max / (Math.random() * max + min));
}

async function signedUp(id) {
    const { data } = await supabase
        .from('balance')
        .select('id')
        .eq('id', id)
    return (typeof data[0] !== "undefined")
}

client.on("messageCreate", async message => {
    const messageLower = message.content.toLowerCase();
    const args = message.content
        .slice(process.env.PREFIX.length)
        .trim()
        .split(/ +/g);
    const command = args.shift().toLowerCase();
    if (message.author.bot) return; //if message author is a bot
    //if (message.author.id != "239400603346796544" && message.author.id != "296785190792069120") return; //message not sent by me
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
                if (await signedUp(mention.id)) {
                    let { data } = await supabase
                        .from('balance')
                        .select('value')
                        .eq('id', mention.id)
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
                if (await signedUp(message.author.id)) {
                    output.edit(`${message.author.username}'s bank balance is: $${data[0].value}`)
                } else {
                    output.edit("You have not signed up yet")
                }
            }
        }
            break;

        case "signup": {
            if (!await signedUp(message.author.id)) { //check if new person is not already in the database
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
            if (message.author.id != "239400603346796544" && message.author.id != "296785190792069120") break; //message not sent by me
            if (!mention) {
                output.edit("Please mention someone")
                break;
            }
            if (await signedUp(mention.id)) {
                await supabase
                    .from('balance')
                    .update({ value: args[1] })
                    .eq('id', mention.id)
                output.edit(`Set ${mention.username}'s balance to ${args[1]}`)
            } else {
                output.edit("User is not signed up!")
            }
        }
            break;

        case "delete": {
            if (message.author.id != "239400603346796544" && message.author.id != "296785190792069120") break; //message not sent by me
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
                if (m.content == "yes") {
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
                if (collected.size === 0) {
                    output.edit("Collector expired")
                }
            });
        }
            break
        case "work": {
            if (await signedUp(message.author.id)) {
                const rng = Math.random()
                if (rng > 0.8) {
                    salary = Math.round((0.85 + Math.random()) * 10000)
                } else if (0.8 > rng && rng > 0.5) {
                    salary = Math.round((Math.min(0.85, Math.max(0.6, Math.random()))) * 10000 + Math.random() * 1000)
                } else {
                    salary = Math.round((Math.min(0.55, Math.max(0.1, Math.random()))) * 10000 + Math.random() * 1000)
                }
                //get old balance
                let { data } = await supabase
                .from('balance')
                .select('value')
                .eq('id', message.author.id)
                //add salary to balance
                await supabase
                    .from('balance')
                    .update({ value: data[0].value + salary })
                    .eq('id', message.author.id)
                output.edit(`You earned $${salary}!`)
            } else {
                output.edit("You are not signed up (use !signup to signup)")
            }
        }
            break
        default:
            output.edit("That's not a command!")
    }
});
client.login(process.env.DISCORD_TOKEN);
