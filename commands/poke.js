const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("poke")
		.setDescription("Poke the bot"),

	async execute(interaction){
		await interaction.reply("Ow, quit it");
	},
};