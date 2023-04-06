require("dotenv/config");
const { Client, IntentsBitField } = require('discord.js')
const { Configuration, OpenAIApi } = require('openai')
const bot_configuration = require('./bot_config')

const openaiConfig = new Configuration({
    apiKey : process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(openaiConfig);

const Bot = new Client({
    intents:[
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

Bot.on('ready', () => {
    console.log("The bot is online");
});

Bot.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== process.env.CHANNEL_ID) return;
    if (message.content.startsWith(bot_configuration.avoid_prefix)) return;

    let conversationLog = [{role : 'system', content : "You are a Makise Kurisu chatbot"}];

    await message.channel.sendTyping();

    let prevMessages = await message.channel.messages.fetch({ limit : 15});
    prevMessages.reverse();

    prevMessages.forEach((msg) => {
        if (message.content.startsWith(bot_configuration.avoid_prefix)) return;
        if (msg.author.id !== Bot.user.id && message.author.bot) return;
        if (msg.author.id !== message.author.id) return;

        conversationLog.push({
            role : 'user',
            content : msg.content,
        });
    });



    const result = await openai.createChatCompletion({
        model : 'gpt-3.5-turbo',
        messages : conversationLog,
    })

    message.reply(result.data.choices[0].message);
});

Bot.login(process.env.DISCORD_BOT_TOKEN);