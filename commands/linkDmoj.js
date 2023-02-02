const {SlashCommandBuilder} = require('@discordjs/builders');
const dmoj = require("../dmoj.js");
const bot = require("../bot.js");
const fs = require("fs");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Link user with DMOJ account')
        .addStringOption(option => option.setName("name").setDescription('DMOJ Username').setRequired(true)),
    async execute(interaction) {
        let name = interaction.options.getString('name');
        if (await dmoj.checkUserExists(name)) {
            const guildID = await interaction.guild.id;
            const UserID = await interaction.user.id;
            const file = fs.readFileSync('views/dmoj.json');
            const today = new Date();
            let oldObj = JSON.parse(file.toString());
            let newObj;
            newObj = {[UserID]: {"name": name, "points": {[today.toJSON().split("T")[0]]: await dmoj.getUserPoints(name)}, "submissions": {"count": 0, "data" : {}}}};
            newGuild = {[guildID]: {...oldObj.guilds[guildID], ...newObj}};
            fs.writeFileSync("views/dmoj.json", JSON.stringify({"guilds": {...oldObj.guilds, ...{[guildID]: {...oldObj.guilds[guildID], ...newObj}}}}));
            return interaction.reply(bot.constructEmbed("00c8b2", `Success! ${interaction.user.username} has been succesfully linked to ${name}!`, interaction.user));
        } else {
            return interaction.reply(bot.constructError("User does not exist!", interaction.user));
        }
    }
};
    