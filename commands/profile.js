const {SlashCommandBuilder} = require('@discordjs/builders');
const dmoj = require("../dmoj.js");
const bot = require("../bot.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Returns DMOJ profile')
        .addStringOption(option =>
            option.setName("name")
                .setDescription('DMOJ Username'))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Discord User')),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const user = interaction.options.getUser('user');
        let dmojName;
        let authorName; //name used for Embed author
        let authorIcon;
        if (name) {
            if (await dmoj.checkUserExists(name)) {
                dmojName = name;
                authorName = name;
                authorIcon = "https://avatars.githubusercontent.com/u/6934864?s=200&v=4";
            } else {
                return interaction.reply(bot.constructError("User does not exist!", interaction.user));
            }
        } else if (user) {
            if (await dmoj.checkDiscordUserLinked(user.id, interaction.guild.id)) {
                dmojName = await dmoj.getUsername(user.id, interaction.guild.id);
                authorName = user.username;
                authorIcon = user.avatarURL();
            } else {
                return interaction.reply(bot.constructError(`${user.username} has not linked their account to DMOJ!`, user));
            }
        } else {
            if (await dmoj.checkDiscordUserLinked(interaction.user.id, interaction.guild.id)) {
                dmojName = await dmoj.getUsername(interaction.user.id, interaction.guild.id);
                authorName = interaction.user.username;
                authorIcon = interaction.user.avatarURL();
            } else {
                return interaction.reply(bot.constructError(`You have not linked your account to DMOJ!`, interaction.user));
            }
        }
        const account = await dmoj.getUserProfile(dmojName);
        let latestProblems = '';
        if (Object.keys(account.solved_problems).length >= 5) {
            for (let i = 0; i < 5; i++) {
                const problem = await dmoj.getProblem(account.solved_problems[Object.keys(account.solved_problems).length - i - 1]);
                latestProblems += `[${problem.name}](https://dmoj.ca/problem/${problem.code})\n`;
            }
        } else if (Object.keys(account.solved_problems).length === 0) {
            latestProblems = `${dmojName} has not solved any problems`;
        } else {
            for (let i = 0; i < Object.keys(account.solved_problems).length; i++) {
                const problem = await dmoj.getProblem(account.solved_problems[Object.keys(account.solved_problems).length - i - 1]);
                latestProblems += `[${problem.name}](https://dmoj.ca/problem/${problem.code})\n`;
            }
        }
        return interaction.reply({
            embeds: [{
                color: "00c8b2",
                author: {
                    name: authorName,
                    icon_url: authorIcon,
                },
                title: dmojName,
                url: `https://dmoj.ca/user/${dmojName}`,
                fields: [
                    {
                        name: 'Points:',
                        value: `
                        Weighted: ${Math.round(account.performance_points)}
                        Total: ${Math.round(account.points)}`,
                    },
                    {
                        name: 'Problems Solved:',
                        value: String(account.problem_count)
                    },
                    {
                        name: 'Latest Problems:',
                        value: latestProblems
                    }
                ],
            }]
        });
    }
};
