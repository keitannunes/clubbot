const { SlashCommandBuilder } = require('@discordjs/builders');
const functions = require("../functions");
const bot = require("../bot")
const db = require("../database")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bet')
        .setDescription('bet on a coin flip')
        .addIntegerOption(option => option.setName('amount').setDescription('Enter the bet amount').setRequired(true))
        .addStringOption(option => option.setName("decision").setDescription('Either heads or tails').setRequired(true).addChoice('Heads','Heads').addChoice('Tails','Tails')), //this is awesome
    async execute(interaction) {
        const bet = interaction.options.getInteger('amount');
        let decision = interaction.options.getString('decision');
        if (!await db.signedUp(interaction.user.id)) { //if person is not signed up
            return interaction.reply(bot.constructError('You are not signed up (use /signup to signup)', interaction.user));
        } else {//if signed up
            const oldBalance = await db.getBalance(interaction.user.id);
            if (bet <= 0) {//if player bets a negative integer
                return interaction.reply(bot.constructError(`Please bet a positive integer`, interaction.user));
            } else if (bet > oldBalance) { //if player does not have sufficient funds
                return interaction.reply(bot.constructError(`You have insufficient funds!`, interaction.user));
            } else {
                //convert heads/tails to boolean values
                if (decision == 'Heads') choice = true
                else  choice = false
                const roll = Math.random() > 0.5;
                console.log(roll)
                if (roll == choice) {
                    await db.setBalance(interaction.user.id, oldBalance + bet); // add winnings to balance 
                    return interaction.reply(bot.constructEmbed("#008000",`You guessed ${decision} correctly! You won $${functions.addCommas(bet)}!`,interaction.user))
                } else {
                    await db.setBalance(interaction.user.id, oldBalance - bet); // deduct losses from balance
                    return interaction.reply(bot.constructEmbed("#ff0000",`You incorrectly guessed ${decision}! You lost $${functions.addCommas(bet)}!`,interaction.user))
                }
            }
        }
    }
}