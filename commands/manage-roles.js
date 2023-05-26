const { SlashCommandBuilder } = require('discord.js');
const utils = require("../utils.js");

module.exports = {
	data: new SlashCommandBuilder()
	.setName("manage-roles")
	.setDescription("add or remove roles from the manager")
	.setDefaultPermission(false)
	.addRoleOption(option =>
		option.setName("role")
		.setDescription("The role to add or remove from the menu")
		.setRequired(true))
	.addStringOption(option =>
		option.setName("description")
		.setDescription("A description of the role")
		.setRequired(true)),

	async getPermissions(guild){
	  return {
        id: guild.roles.cache.find(item => item.name == "Admin").id,
        type: "ROLE",
        permission: true
      };
	},

	async execute(interaction){
		const role = interaction.options.getRole("role");
		var managedRoles = await utils.loadFile("managedRoles");
		var found = -1;

		for(var i = 0; i < managedRoles.length; i++){
			if(managedRoles[i][0] == role.id){
				found = i;
				break;
			}
		}

		var operation = "removed";
		if(found != -1){
			managedRoles.splice(found, 1);
		}
		else{
			operation = "added";
			managedRoles.push([role.id, interaction.options.getString("description")]);
		}

		await utils.saveFile("managedRoles", managedRoles);
		await interaction.reply(`${role.name} ${operation}!`);
	}
}