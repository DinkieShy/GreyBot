const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
			const role = await interaction.guild.roles.fetch(managedRoles[i][0]);
			options.push(
				new StringSelectMenuOptionBuilder()
				.setLabel(`${role.name}`)
				.setValue(managedRoles[i][0])
				.setDescription(managedRoles[i][1])
			);
		}

		const menu = new ActionRowBuilder()
			.addComponents(
				new StringSelectMenuOptionBuilder()
					.setCustomId("select")
					.setPlaceholder("Nothing Selected")
					.addOptions(options)
					.setMinValues(1)
			);

		const cancelButton = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId("cancel")
					.setLabel("Cancel")
					.setStyle(ButtonStyle.Danger)
			)
			.addComponents(
				new ButtonBuilder()
					.setCustomId("removeAll")
					.setLabel("Remove All")
					.setStyle(ButtonStyle.Danger)
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
				var add = (interaction.values.indexOf(managedRoles[i][0]) != -1);
				var alreadyHas = interaction.member.roles.cache.has(managedRoles[i][0]);
				var role = await interaction.guild.roles.fetch(managedRoles[i][0]);

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
			var alreadyHas = interaction.member.roles.cache.has(managedRoles[i][0]);
			var role = await interaction.guild.roles.fetch(managedRoles[i][0]);

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