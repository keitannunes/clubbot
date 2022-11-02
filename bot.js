const fs = require("fs");
const { Client, Collection, Intents, MessageActionRow, MessageButton, MessageEmbed } = require('discord.js'); //stole from stackoverflow can't use const discord = require("discord.js"); anymore :(
const client = new Client({ intents: [Intents.FLAGS.GUILDS],fetchAllMembers: true }); //??????????!?!?! what are intents please help me
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const dmoj = require("./dmoj.js")
require('dotenv').config();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
client.commands = new Collection();
const error1 = setTimeout(function () {
	console.log("\x1b[41m", "ERROR: UNABLE TO CONNECT TO DISCORD SERVER");
}, 10000);

//exports
const workCooldown = new Map();

function getGuild(id){
	return client.guilds.get(id)
}

function constructEmbed(colour, content, user) {
	return ({
		embeds: [{
			color: colour,
			author: {
				name: user.username,
				icon_url: user.avatarURL(),
			},
			description: content
		}]
	})
}

function constructError(content, user) {
	return ({
		embeds: [{
			color: "#db3e00",
			author: {
				name: user.username,
				icon_url: user.avatarURL(),
			},
			description: content
		}]
		, ephemeral: true
	})
}

function constructButtons(primaryText, secondaryText) {
	return new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId(primaryText)
				.setLabel(primaryText)
				.setStyle('PRIMARY'),
			new MessageButton()
				.setCustomId(secondaryText)
				.setLabel(secondaryText)
				.setStyle('SECONDARY'),
		);
}


function start() {
	console.clear()
	console.log("Loading... Please wait");
	client.on("ready", () => {
		clearTimeout(error1);
		console.log(`Logged into ${client.guilds.cache.size} guilds`)
		console.log("");
		console.log("Log:");
		console.log("");
		client.user.setActivity(fs.readFileSync("views/game.txt", "utf8")); 
		profilePicture = client.user.avatarURL()
	});

	setInterval(() => dmoj.updatePoints(), 300000) //update dmoj points every 5 mins


	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		client.commands.set(command.data.name, command);
	}

	client.on('interactionCreate', async interaction => {
		//if interaction was a command
		if (interaction.isCommand()) {
			const command = client.commands.get(interaction.commandName);
			if (!command) return;
			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
		//buttons
	});
	client.login(process.env.DISCORD_TOKEN);
}
 
module.exports = { workCooldown, getGuild, constructEmbed, constructError, constructButtons, start };
