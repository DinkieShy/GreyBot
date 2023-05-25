const { SlashCommandBuilder } = require('@discordjs/builders');

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
        id: guild.roles.cache.find(item => item.name == "Members").id,
        type: "ROLE",
        permission: true
      };
	},

	async execute(interaction){
		const roleToAssign = interaction.options.getString("pronouns");
		if(roleToAssign == ""){
			interaction.reply({content: "You forgot to write your pronouns!", ephemeral: true});
		}
		const roles = interaction.guild.roles.cache;
		const availablePronounRoles = roles.filter(item => item.name.includes("pronouns: "));
		var roleFound = false;

		availablePronounRoles.each(async role => {
			if(role.name.slice(10) == roleToAssign){
				await interaction.member.roles.add(role).then(async newMember => {
					await interaction.reply("Enjoy your new pronoun role!");
				}).catch(async error => {
					console.log(error);
					await interaction.followUp("There was an error! Go poke Dinkie please ;-;");
				});
				roleFound = true;
			}
			else{
				if(role.members.get(interaction.user.id) != undefined){
					await interaction.member.roles.remove(role);
				}
				if(role.members.size == 0){
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
				await interaction.followUp("There was an error! Go poke Dinkie please ;-;");
			});
		}
	}
}