const { SlashCommandBuilder } = require('@discordjs/builders');
const dmoj = require("../dmoj.js");
const bot = require("../bot.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('points')
        .setDescription('Returns DMOJ points of given user')
        .addStringOption(option => option.setName("name").setDescription('DMOJ Username'))
        .addUserOption(option => option.setName('user').setDescription('Discord User')),
    async execute(interaction) {
        let name = interaction.options.getString('name');
        let user = interaction.options.getUser('user');
        if (name) {
            if (await dmoj.checkUserExists(name)) {
                dmoj.getUserPoints(name).then(points => {
                    return interaction.reply(bot.constructEmbed("00c8b2", `${name} has ${Math.round(points)} DMOJ points!`, interaction.user));
                });
            } else {
                return interaction.reply(bot.constructError("User does not exist!", interaction.user));
            }
        } else if (user) {
            if (await dmoj.checkDiscordUserLinked(user.id, interaction.guild.id)) {
                username = await dmoj.getUsername(user.id,interaction.guild.id)
                dmoj.getUserPoints(username).then(points => {
                    return interaction.reply(bot.constructEmbed("00c8b2", `${username} has ${Math.round(points)} DMOJ points!`, user));
                });
            } else {
                return interaction.reply(bot.constructError(`${user.username} has not linked their account to DMOJ!`, user))
            }
        } else {
            if (await dmoj.checkDiscordUserLinked(interaction.user.id, interaction.guild.id)) {
                username = await dmoj.getUsername(interaction.user.id,interaction.guild.id)
                dmoj.getUserPoints(username).then(points => {
                    return interaction.reply(bot.constructEmbed("00c8b2", `${username} has ${Math.round(points)} DMOJ points!`, interaction.user));
                });
            } else {
                return interaction.reply(bot.constructError(`You have not linked your account to DMOJ!`, interaction.user))
            }
        }
    }
};
