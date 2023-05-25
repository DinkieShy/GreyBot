const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');
const utils = require("../utils.js");

module.exports = {
	data: new SlashCommandBuilder()
	.setName("roles")
	.setDescription("get or remove roles")
	.setDefaultPermission(false),

	async getPermissions(guild){
	  return {
        id: guild.roles.cache.find(item => item.name == "Members").id,
        type: "ROLE",
        permission: true
      };
	},

	async execute(interaction){
		const managedRoles = await utils.loadFile("managedRoles");
		var options = [];

		for(var i = 0; i < managedRoles.length; i++){
			const role = await interaction.guild.roles.fetch(managedRoles[i]);
			options.push({
				"label": `${role.name}`,
				"value": managedRoles[i]
			});
		}

		const menu = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId("select")
					.setPlaceholder("Nothing Selected")
					.addOptions(options)
					.setMinValues(1)
			);

		const cancelButton = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId("cancel")
					.setLabel("Cancel")
					.setStyle("DANGER"))
			.addComponents(
				new MessageButton()
					.setCustomId("removeAll")
					.setLabel("Remove All")
					.setStyle("DANGER")
			);

		interaction.reply({
			content: "Select the roles you want! Leaving a role unselected will remove it.\nYou can also hit \"Remove All\" to remove every role on this list.",
			components: [menu, cancelButton]
		});
	},

	async menuFollowUp(interaction){
		if(interaction.values.length != 0){
			const managedRoles = await utils.loadFile("managedRoles");
			var addedRoles = 0;
			var removedRoles = 0;

			for(var i = 0; i < managedRoles.length; i++){
				var add = (interaction.values.indexOf(managedRoles[i]) != -1);
				var alreadyHas = interaction.member.roles.cache.has(managedRoles[i]);
				var role = await interaction.guild.roles.fetch(managedRoles[i]);

				if(add && !alreadyHas){
					await interaction.member.roles.add(role);
					addedRoles += 1;
				}
				else if(!add && alreadyHas){
					await interaction.member.roles.remove(role);
					removedRoles += 1;
				}
			}

			await interaction.update({content: `Added ${addedRoles} roles and removed ${removedRoles}!`, components: []});
		}
	},

	async buttonFollowUp(interaction){
		const managedRoles = await utils.loadFile("managedRoles");
		var removedRoles = 0;

		for(var i = 0; i < managedRoles.length; i++){
			var alreadyHas = interaction.member.roles.cache.has(managedRoles[i]);
			var role = await interaction.guild.roles.fetch(managedRoles[i]);

			if(alreadyHas){
				await interaction.member.roles.remove(role);
				removedRoles += 1;
			}
		}

		await interaction.update({content: `Removed ${removedRoles} roles`, components: []});
	},

	async cancelButtonFollowUp(interaction){
		await interaction.update({content: "Operation cancelled", components: []});
	}
}