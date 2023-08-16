const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pronouns")
		.setDescription("Give yourself a pronoun role")
		.addStringOption(option =>
			option.setName("pronouns")
			.setDescription("Your pronouns!")
			.setRequired(true)),

	async execute(interaction){
		const roleToAssign = interaction.options.getString("pronouns");
		const roles = await interaction.guild.roles.fetch();
		const members = await interaction.guild.members.fetch();
		const availablePronounRoles = roles.filter(item => item.name.includes("pronouns: "));
		var roleFound = false;

		availablePronounRoles.each(async role => {
			if(role.name.slice(10) == roleToAssign){
				roleFound = true;
				await interaction.member.roles.add(role).then(async newMember => {
					await interaction.reply("Enjoy your new pronoun role!");
				}).catch(async error => {
					console.log(error);
					if (!interaction.isRepliable()){
						await interaction.followUp({ content: 'There was an error while executing this command!'});
					}
					else{
						await interaction.reply({ content: 'There was an error while executing this command!'});
					}
				});
			}
			else{
				if(interaction.member.roles.cache.get(role.id) != undefined){
					await interaction.member.roles.remove(role);
				}
				if(members.filter(member => member.roles.cache.get(role.id) != undefined && member.id != interaction.member.id).size == 0){
					await role.delete("Not being used at the moment!");
				}
			}
		});

		if(roleFound == false){
			interaction.guild.roles.create({
				name: "pronouns: " + roleToAssign,
				reason: `Adding pronoun role for ${interaction.user.username}`
			}).then(async newRole => {
				interaction.member.roles.add(newRole);
				await interaction.reply("Enjoy your new pronoun role!");
			}).catch(async error => {
				console.log(error);
				if (!interaction.isRepliable()){
					await interaction.followUp({ content: 'There was an error while executing this command!'});
				}
				else{
					await interaction.reply({ content: 'There was an error while executing this command!'});
				}
			});
		}
	}
}