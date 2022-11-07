const {SlashCommandBuilder} = require('@discordjs/builders');
const dmoj = require("../dmoj.js");
const bot = require("../bot.js");
const grapher = require("../grapher.js")
const fs = require('fs')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('graph')
        .setDescription("Returns Graph of user's point history")
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Discord User')),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        let userID;
        let authorName; //name used for Embed author
        let authorIcon;
        if (user) {
            if (await dmoj.checkDiscordUserLinked(user.id, interaction.guild.id)) {
                userID = user.id;
                authorName = user.username;
                authorIcon = user.avatarURL();
            } else {
                return interaction.reply(bot.constructError(`${user.username} has not linked their account to DMOJ!`, user));
            }
        } else {
            if (await dmoj.checkDiscordUserLinked(interaction.user.id, interaction.guild.id)) {
                userID = interaction.user.id;
                authorName = interaction.user.username;
                authorIcon = interaction.user.avatarURL();
            } else {
                return interaction.reply(bot.constructError(`You have not linked your account to DMOJ!`, interaction.user));
            }
        }
        const url = await grapher.getChart(userID,interaction.guild.id)
        return interaction.reply({
            embeds: [{
                color: "00c8b2",
                author: {
                    name: authorName,
                    icon_url: authorIcon,
                },
                image: {
                    url: url,
                },
            }],
        })
    }
};
