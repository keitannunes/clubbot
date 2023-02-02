const {SlashCommandBuilder} = require('@discordjs/builders');
const dmoj = require("../dmoj.js");
const bot = require("../bot.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('get language statistics of user')
        .addStringOption(option =>
            option.setName("name")
                .setDescription('DMOJ Username'))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Discord User')),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const user = interaction.options.getUser('user');
        let authorName; //name used for Embed author
        let authorIcon;
        let dmojName;
        let data;
        if (name) {
            if (await dmoj.checkUserExists(name)) {
                dmojName = name;
                authorName = name;
                authorIcon = "https://avatars.githubusercontent.com/u/6934864?s=200&v=4";

                const submissionData = await dmoj.getUserSubmissions(name);
                data = {data : {}, count : submissionData.total_objects};
                for (let i = 0; i < submissionData.total_objects; i++) {
                    const curr = submissionData.objects[i].language;
                    if (!data.data.hasOwnProperty(curr)) {
                        data.data[curr] = 0;
                    }
                    data.data[curr]++;
                }
            } else {
                return interaction.reply(bot.constructError("User does not exist!", interaction.user));
            }
        } else if (user) {
            if (await dmoj.checkDiscordUserLinked(user.id, interaction.guild.id)) {
                authorName = user.username;
                authorIcon = user.avatarURL()
                dmojName = await dmoj.getUsername(user.id, interaction.guild.id);

                await dmoj.cacheUserSubmissions(user.id,interaction.guild.id);
                data = await dmoj.getCachedUserSubmissions(user.id,interaction.guild.id);
            } else {
                return interaction.reply(bot.constructError(`${user.username} has not linked their account to DMOJ!`, user));
            }
        } else {
            if (await dmoj.checkDiscordUserLinked(interaction.user.id, interaction.guild.id)) {
                authorName = interaction.user.username;
                authorIcon = interaction.user.avatarURL();
                dmojName = await dmoj.getUsername(interaction.user.id, interaction.guild.id);

                await dmoj.cacheUserSubmissions(interaction.user.id,interaction.guild.id);
                data = await dmoj.getCachedUserSubmissions(interaction.user.id,interaction.guild.id);
            } else {
                return interaction.reply(bot.constructError(`You have not linked your account to DMOJ!`, interaction.user));
            }
        }
        const unsortedTable = new Map();
        for (const lang in data.data) {
            unsortedTable.set(lang,data.data[lang]);
        }
        const sortedTable = new Map([...unsortedTable.entries()].sort((a, b) => b[1] - a[1]));

        let returnString = "";
        sortedTable.forEach((count, lang) => {
            returnString = returnString + `${lang}: ${Math.round((count/data.count)*1000)/10}%\n`;
        });

        return interaction.reply({
            embeds: [{
                color: "00c8b2",
                author: {
                    name : `${dmojName}'s statistics`,
                    icon_url: authorIcon,
                },
                description: returnString
            }]
        });
    }
};
