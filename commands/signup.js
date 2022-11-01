const { SlashCommandBuilder } = require('@discordjs/builders');
const functions = require("../functions");
const bot = require("../bot")
const db = require("../database")
module.exports = {
	data: new SlashCommandBuilder()
		.setName('signup')
		.setDescription('Create an account to use this bot'),
	async execute(interaction) {
		if (!await db.signedUp(interaction.user.id)) { //check if new person is not already in the database
            try {
                db.signUp(interaction.user.id,interaction.user.username)
              }
              catch(err) {
                  console.log(err)
                interaction.reply(bot.constructError("There was an internal DB error. Please contact Keitan",interaction.user))
              } finally {
                interaction.reply(bot.constructEmbed("00c8b2","Success! You have signed up.",interaction.user))
              }
        } else {
            interaction.reply(bot.constructError("You have already signed up!",interaction.user))
        }
	},
};
