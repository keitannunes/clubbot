const {SlashCommandBuilder} = require('@discordjs/builders');
const {createClient} = require("@supabase/supabase-js");
const functions = require("../functions");
const bot = require("../bot");
const db = require("../database");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Get the balance of the selected user, or your own balance.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user\'s balance to show')),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        if (user) {
            if (await db.signedUp(user.id)) {

                return interaction.reply(bot.constructEmbed("#00c8b2", `${user.username}'s bank balance is: $${functions.addCommas(await db.getBalance(user.id))}`, user));
            } else {
                return interaction.reply("This user has not signed up yet");
            }
        } else {
            if (await db.signedUp(interaction.user.id)) {

                return interaction.reply(bot.constructEmbed("#00c8b2", `Your bank balance is: $${functions.addCommas(await db.getBalance(interaction.user.id))}`, interaction.user));
            } else {
                return interaction.reply(bot.constructError('You are not signed up (use ,signup to signup)', interaction.user));
            }
        }

    },
};
