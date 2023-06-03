const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pronouns")
		.setDescription("Give yourself a pronoun role!")
		.setDefaultPermission(false)
		.addStringOption(option =>
			option.setName("pronouns")
			.setDescription("Your pronouns! Written like \"They/Them\"")
			.setRequired(true)),

	async getPermissions(guild){
	  return {
        id: guild.roles.cache.find(item => item.name == "Member").id,
        type: "ROLE",
        permission: true
      };
	},

	async execute(interaction){
		const roleToAssign = interaction.options.getString("pronouns").trim().toLowerCase();
		const roles = await interaction.guild.roles.fetch();

		const memberCurrentRoles = interaction.member.roles.cache.filter(role => role.name.slice(0,10) == "pronouns: ")
		await interaction.member.roles.remove(memberCurrentRoles, `Removing old pronoun roles from ${interaction.user.username}`); 

		const existingRole = roles.find(role => role.name.slice(10) == roleToAssign);
		if(existingRole != undefined){
			await interaction.member.roles.add(existingRole, `Adding new pronoun role to ${interaction.user.username}`).then(async newMember => {
				await interaction.reply("Enjoy your new pronoun role!");
			}).catch(async error => {
				await interaction.followUp("There was an error! Please poke Grey ;-; (pronouns.js:30)");
			});
		}
		else{
			interaction.guild.roles.create({
				name: "pronouns: " + roleToAssign,
				reason: `Adding pronoun role for ${interaction.user.username}`
			}).then(async newRole => {
				interaction.member.roles.add(newRole);
				await interaction.reply("Enjoy your new pronoun role!");
			}).catch(async error => {
				console.log(error);
				await interaction.followUp("There was an error! Please poke Grey ;-; (pronouns.js:42)");
			});
		}

		interaction.guild.roles.filter(role => role.name.slice(0,10) == "pronouns: ").each(async role => {
			if(role.members.size == 0){
				await role.delete("Deleting unused pronoun role");
			}
		});

		// availablePronounRoles.each(async role => {
		// 	if(role.name.slice(10) == roleToAssign){
		// 		await interaction.member.roles.add(role).then(async newMember => {
		// 			await interaction.reply("Enjoy your new pronoun role!");
		// 		}).catch(async error => {
		// 			console.log(error);
		// 			await interaction.followUp("There was an error! Go poke Grey please ;-; (pronouns.js:33)");
		// 		});
		// 		roleFound = true;
		// 	}
		// 	else{
		// 		if(role.members.get(interaction.user.id) != undefined){
		// 			await interaction.member.roles.remove(role);
		// 		}
		// 		if(role.members.size == 0){
		// 			await role.delete("Not being used at the moment!");
		// 		}
		// 	}
		// });

		// if(roleFound == false){
		// 	interaction.guild.roles.create({
		// 		name: "pronouns: " + roleToAssign,
		// 		reason: `Adding pronoun role for ${interaction.user.username}`
		// 	}).then(async newRole => {
		// 		interaction.member.roles.add(newRole);
		// 		await interaction.reply("Enjoy your new pronoun role!");
		// 	}).catch(async error => {
		// 		console.log(error);
		// 		await interaction.followUp("There was an error! Go poke Grey please ;-;");
		// 	});
		// }
	}
}