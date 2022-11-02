const { SlashCommandBuilder } = require('@discordjs/builders');
const dmoj = require("../dmoj.js");
const bot = require("../bot.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('whois')
        .setDescription('Returns DMOJ username')
        .addUserOption(option => option.setName('user').setDescription('Discord User').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');   
        if (await dmoj.checkDiscordUserLinked(user.id, interaction.guild.id)) {
            return interaction.reply(bot.constructEmbed("00c8b2", `${user.username} is ${await dmoj.getUsername(user.id,interaction.guild.id)} on DMOJ`, user));
        } else {
            return interaction.reply(bot.constructError(`${user.username} has not linked their account to DMOJ!`, user))
        }
    }
};
