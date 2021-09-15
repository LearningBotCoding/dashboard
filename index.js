const Discord = require('discord.js');
const client = new Discord.Client({
	intents: ['GUILDS', 'GUILD_MESSAGES']
});

client.on('ready', () => {
	require('./dashboard')(client);
});

client.on('messageCreate', (message) => {
	require('./commands')(message);
})

client.login(process.env.token);
