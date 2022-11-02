const { SlashCommandBuilder } = require('@discordjs/builders');
const functions = require("../functions");
const bot = require("../bot")
const db = require("../database")
const fs = require("fs")
module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription("Shows a leaderboard of people's balances")
    .addStringOption(option => option.setName("scope").setDescription('Choose local leaderboard').addChoice('Local', 'Local').addChoice('DMOJ','DMOJ')),
  async execute(interaction) {
    let scope = interaction.options.getString('scope');
    const data = await db.getAll()
    const unsortedTable = new Map()
    let leaderboardString = "";
    if (scope == "Local") {
      //db.deleteUser()
      for (const row in data) {
        // console.log(await interaction.guild.members.fetch(data[row].discordid))
        try {
          await interaction.guild.members.fetch(data[row].discordid)
          unsortedTable.set(data[row].username, data[row].value)
        } catch (err) {
          console.log("No member")
        }
        // if (!await interaction.guild.members.fetch(data[row].discordid)) continue
        // unsortedTable.set(data[row].username,data[row].value)
      }
    } else if (scope == "DMOJ"){
      scope = "Local DMOJ"
      const file = fs.readFileSync('views/dmoj.json')
      const json = JSON.parse(file.toString())
      for (const property in json.guilds[interaction.guild.id]) {
        unsortedTable.set(json.guilds[interaction.guild.id][property].name, Math.round(json.guilds[interaction.guild.id][property].points))
      }
    } else {
      scope = "Global"
      for (const row in data) {
        unsortedTable.set(data[row].username, data[row].value)
      }
    }
    const sortedTable = new Map([...unsortedTable.entries()].sort((a, b) => b[1] - a[1]));
    sortedTable.forEach((value, username) => {
      leaderboardString = leaderboardString + `${username}: ${functions.addCommas(value)}\n`
    });
    return interaction.reply({
      embeds: [{
        color: "00c8b2",
        author: {
          name: `${scope} Leaderboard`,
          icon_url: 'https://github.com/keitannunes/clubbot/blob/master/views/leaderboard.png?raw=true',
        },
        description: leaderboardString
      }]
    })
  },
};