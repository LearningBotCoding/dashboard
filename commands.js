const { Message } = require('discord.js');
const db = require('quick.db')

/*
* @param {Message} message
*/

module.exports = (message) => {
	if(message.author.bot) return;
	let bprefix = db.get(`prefix_${message.guild.id}`);
	if(!bprefix) bprefix = "!"
	if(!message.content.startsWith(bprefix)) return;
	  const args = message.content.slice(bprefix.length).trim().split(/ +/g);
  	  const command = args.shift().toLowerCase();
		if(command === "sp") {
			const prefix = args.join(' ');
			if(!prefix) return message.reply("Please provide a prefix to set");

			db.set(`prefix_${message.guild.id}`, prefix);
			message.reply(`Succesfully set prefix set as ${prefix}`)
		}
}
