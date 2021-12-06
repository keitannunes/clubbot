const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

const commands = []; //commands array that we gonna push files into
const commandFiles = fs.readdirSync('./commands')

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
rest.put(Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GVSSID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
    rest.put(Routes.applicationGuildCommands(process.env.CLIENTID, process.env.TESTSERVERID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);


