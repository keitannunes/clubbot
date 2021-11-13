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

//hashtables
const workCooldown = new Map()

//functions
function rng(min, max) {
    return Math.round(max / (Math.random() * max + min));
}

function addCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); //thank you stackoverflow
}

async function signedUp(id) {
    const { data } = await supabase
        .from('balance')
        .select('id')
        .eq('id', id)
    return typeof data[0] !== "undefined"
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
        case "bal":
        case "balance": {
            if (mention) {
                if (await signedUp(mention.id)) {
                    const { data } = await supabase
                        .from('balance')
                        .select('value')
                        .eq('id', mention.id)
                    output.delete();
                    message.channel.send({
                        embeds: [{
                            color: "#00c8b2",
                            author: {
                                name: mention.username,
                                icon_url: mention.avatarURL(),
                            },
                            description: `${mention.username}'s bank balance is: $${addCommas(data[0].value)}`
                        }]
                    })
                } else {
                    output.edit("This user has not signed up yet")
                }
            } else {
                const { data, err } = await supabase
                    .from('balance')
                    .select('value')
                    .eq('id', message.author.id)

                if (err) {
                    console.log(err)
                    output.edit(output.edit("There was an error processing your request"))
                }
                if (await signedUp(message.author.id)) {
                    output.delete();
                    message.channel.send({
                        embeds: [{
                            color: "#00c8b2",
                            author: {
                                name: message.author.username,
                                icon_url: message.author.avatarURL(),
                            },
                            description: `Your bank balance is: $${addCommas(data[0].value)}`
                        }]
                    })
                    //output.edit(`${message.author.username}'s bank balance is: $${addCommas(data[0].value)}`)
                } else {
                    output.edit("You have not signed up yet (use ,signup)")
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
            if (message.author.id != "239400603346796544" && message.author.id != "296785190792069120") {
                output.edit("You dont have the required perms to use that command!")
                break;
            }
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
            if (message.author.id != "239400603346796544" && message.author.id != "296785190792069120") {
                output.edit("You dont have the required perms to use that command!")
                break; //message not sent by me
            }
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
                if (workCooldown.get(message.author.id) + 60000 > Date.now()) {
                    output.delete()
                    message.channel.send({
                        embeds: [{
                            color: "#e32a00",
                            author: {
                                name: message.author.username,
                                icon_url: message.author.avatarURL(),
                            },
                            description: `You have to wait ${Math.round((workCooldown.get(message.author.id) + 60000 - Date.now()) / 1000)} seconds!`
                        }]
                    })
                    break;
                }
                const rng = Math.random()
                if (rng >= 0.9) {
                    salary = Math.round((0.70 + Math.random()) * 10000)
                } else if (0.9 > rng && rng >= 0.6) {
                    salary = Math.round((Math.min(0.85, Math.max(0.6, Math.random()))) * 10000 + Math.random() * 1000)
                } else {
                    salary = Math.round((Math.min(0.55, Math.max(0.1, Math.random()))) * 10000 + Math.random() * 1000)
                }
                //get old balance
                const { data } = await supabase
                    .from('balance')
                    .select('value')
                    .eq('id', message.author.id)
                //add salary to balance
                await supabase
                    .from('balance')
                    .update({ value: data[0].value + salary })
                    .eq('id', message.author.id)
                workCooldown.set(message.author.id, Date.now()) //set cooldown start time
                output.delete();
                message.channel.send({
                    embeds: [{
                        color: "#41ab1e",
                        author: {
                            name: message.author.username,
                            icon_url: message.author.avatarURL(),
                        },
                        description: `You earned $${addCommas(salary)}!`
                    }]
                })
            } else {
                output.edit("You are not signed up (use ,signup to signup)")
            }
        }
            break
        case "bet":
        case "cf":
        case "coinflip": {
            if (!await signedUp(message.author.id)) {
                output.delete()
                message.channel.send({
                    embeds: [{
                        color: "#e32a00",
                        author: {
                            name: message.author.username,
                            icon_url: message.author.avatarURL(),
                        },
                        description: `You are not signed up (use ,signup to signup)`
                    }]
                })
                break;
            }
            if (args[0] % 1 !== 0 || args[0] <= 0) {
                output.delete()
                message.channel.send({
                    embeds: [{
                        color: "#e32a00",
                        author: {
                            name: message.author.username,
                            icon_url: message.author.avatarURL(),
                        },
                        description: `Please bet a positive integer`
                    }]
                })
                break;
            }

            const { data } = await supabase
                        .from('balance')
                        .select('value')
                        .eq('id', message.author.id)
            if (args[0] > data[0].value) {
                output.delete()
                message.channel.send({
                    embeds: [{
                        color: "#e32a00",
                        author: {
                            name: message.author.username,
                            icon_url: message.author.avatarURL(),
                        },
                        description: `You have insufficient funds!`
                    }]
                })
                break;
            }
            if (Math.random() < 0.5) { //tails
                if (args[1] == "tails" || args[1] == "t") { //if tails and bet tails
                    //add winnings to balance
                    const winnings = data[0].value + parseInt(args[0])
                    await supabase
                        .from('balance')
                        .update({ value: winnings})
                        .eq('id', message.author.id)
                    output.delete();
                    message.channel.send({
                        embeds: [{
                            color: "#41ab1e",
                            author: {
                                name: message.author.username,
                                icon_url: message.author.avatarURL(),
                            },
                            description: `Tails! You won $${addCommas(args[0])}!`
                        }]
                    })
                } else if (args[1] == "heads" || args[1] == "h") { // if tails and bet heads
                    //deduct winnings to balance
                    const losses = data[0].value - parseInt(args[0])
                    await supabase
                        .from('balance')
                        .update({ value: losses })
                        .eq('id', message.author.id)
                    output.delete();
                    message.channel.send({
                        embeds: [{
                            color: "#ff0000",
                            author: {
                                name: message.author.username,
                                icon_url: message.author.avatarURL(),
                            },
                            description: `Tails! You lost $${addCommas(args[0])}`
                        }]
                    })
                } else {
                    output.delete()
                    message.channel.send({
                        embeds: [{
                            color: "#e32a00",
                            author: {
                                name: message.author.username,
                                icon_url: message.author.avatarURL(),
                            },
                            description: `Please predict either heads, h, tails or t`
                        }]
                    })
                    break;
                }
            } else {
                if (args[1] == "heads" || args[1] == "h") { //if heads and bet heads
                    //add winnings to balance
                    const winnings = data[0].value + parseInt(args[0])
                    await supabase
                        .from('balance')
                        .update({ value: winnings})
                        .eq('id', message.author.id)
                    output.delete();
                    message.channel.send({
                        embeds: [{
                            color: "#41ab1e",
                            author: {
                                name: message.author.username,
                                icon_url: message.author.avatarURL(),
                            },
                            description: `Heads! You won $${addCommas(args[0])}!`
                        }]
                    })
                } else if (args[1] == "tails" || args[1] == "t") { //if tails and bet tails
                    //deduct winnings to balance
                    const losses = data[0].value - parseInt(args[0])
                    await supabase
                        .from('balance')
                        .update({ value: losses })
                        .eq('id', message.author.id)
                    output.delete();
                    message.channel.send({
                        embeds: [{
                            color: "#ff0000",
                            author: {
                                name: message.author.username,
                                icon_url: message.author.avatarURL(),
                            },
                            description: `Tails! You lost $${addCommas(args[0])}`
                        }]
                    })
                } else {
                    output.delete()
                    message.channel.send({
                        embeds: [{
                            color: "#e32a00",
                            author: {
                                name: message.author.username,
                                icon_url: message.author.avatarURL(),
                            },
                            description: `Please predict either heads, h, tails or t`
                        }]
                    })
                    break;
                }
            }
        }
            break;
        default:
            output.edit("That's not a command!")
    }
});
client.login(process.env.DISCORD_TOKEN);
