const {SlashCommandBuilder} = require('@discordjs/builders');
const bot = require("../bot.js");

const {Configuration, OpenAIApi} = require("openai");
const configuration = new Configuration({
    organization: process.env.OPENAI_ORG,
    apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prompt')
        .setDescription('OpenAI prompt test')
        .addStringOption(option =>
            option.setName("prompt")
                .setDescription('AI Prompt')
                .setRequired(true)
        ),
    async execute(interaction) {
        interaction.reply("Thinking...");
        const prompt = interaction.options.getString('prompt');
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            max_tokens: 1000,
            prompt: prompt,
        });
        console.log(completion.data);
        if (completion.data.choices[0].finish_reason === "length") {
            interaction.editReply(`\`\`\`${completion.data.choices[0].text}\`\`\`Reply too large`);
        } else {
            interaction.editReply(`\`\`\`${completion.data.choices[0].text}\`\`\``);
        }
    }
};
