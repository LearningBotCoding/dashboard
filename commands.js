const {Message} = require
(
	'discord.js'
);

/*
* @param {Message} message
*/

module.exports = (message) => {
	if(message.author.bot) return;
	if(message.content === 'setprefix') {
		return;
	}
}
