const {SlashCommandBuilder} = require('@discordjs/builders');
const functions = require("../functions");
const bot = require("../bot");
const db = require("../database");
module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work to earn money.'),
    async execute(interaction) {
        if (bot.workCooldown.get(interaction.user.id) + 60000 > Date.now()) { //if command is on cooldown
            return interaction.reply(bot.constructEmbed("e32a00", `You have to wait ${Math.round((bot.workCooldown.get(interaction.user.id) + 60000 - Date.now()) / 1000)} seconds!`, interaction.user));
        } else if (await db.signedUp(interaction.user.id)) {
            //determine income
            const rng = Math.random();
            if (rng >= 0.95) {
                salary = Math.round((0.70 + Math.random()) * 10000);
            } else if (0.95 > rng && rng >= 0.6) {
                salary = Math.round((Math.min(0.85, Math.max(0.6, Math.random()))) * 10000 + Math.random() * 1000);
            } else {
                salary = Math.round((Math.min(0.55, Math.max(0.1, Math.random()))) * 10000 + Math.random() * 1000);
            }

            const oldBalance = await db.getBalance(interaction.user.id);//get old balance
            db.setBalance(interaction.user.id, oldBalance + salary); //add salary to balance

            bot.workCooldown.set(interaction.user.id, Date.now()); //set cooldown start time

            return interaction.reply(bot.constructEmbed("41ab1e", `You earned $${functions.addCommas(salary)}!`, interaction.user));
        } else {
            return interaction.reply(bot.constructError('You are not signed up (use ,signup to signup)', interaction.user));
        }
    }
};