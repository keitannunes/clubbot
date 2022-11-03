const {SlashCommandBuilder} = require('@discordjs/builders');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check if bot is alive'),
    async execute(interaction) {
        await interaction.reply(`Pong! Bot is alive!`);
    }
};
