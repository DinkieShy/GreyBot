
TEST_MODE = false;

const {Client, Collection, GatewayIntentBits, REST, Routes} = require('discord.js');
const fs = require('fs');

const auth = require("./secret/auth.json");
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.DirectMessages] });

// LOGIN / AUTHENTICATE

client.once('ready', () => {
	console.log('Ready!');
	console.log(`Logged in as ${client.user.tag}!`);
	deployCommands();
});

token = auth.token;
GUILD_ID = auth.guild;
if(TEST_MODE == true){
	GUILD_ID = auth.testGuild;
	token = auth.test;
}

client.login(token);
client.commands = new Collection();

// SET UP COMMANDS

async function deployCommands(){
	client.commands.clear();
	const commands = [];
	var commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		commands.push(command.data.toJSON());
		client.commands.set(command.data.name, command);
	}

	const rest = new REST({ version: '10' }).setToken(token);

	try{
		console.log("Refreshing application commands");
		await rest.put(Routes.applicationCommands(client.user.id), { body: commands })
		console.log('Successfully registered application commands.')
	}
	catch(err){
		console.error(err);
	}
}

// HANDLE COMMANDS

client.on('interactionCreate', async interaction => {
	if(interaction.isCommand()){
		const command = client.commands.get(interaction.commandName);

		if (!command){
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
	else if(interaction.user == interaction.message.interaction.user){
		if(interaction.isSelectMenu()){
			if(interaction.customId != "ignore"){
				disableComponents(interaction);

				const commandName = interaction.message.interaction.commandName;
				const command = client.commands.get(commandName);

				try{
					await command.menuFollowUp(interaction);
				} catch (error) {
					console.error(error);
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		}
		else if(interaction.isButton()){
			const commandName = interaction.message.interaction.commandName;
			const command = client.commands.get(commandName);

			if(interaction.customId == "cancel"){
				try{
					await command.cancelButtonFollowUp(interaction);
				} catch (error) {
					console.error(error);
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
			else{
				disableComponents(interaction);
				try{
					await command.buttonFollowUp(interaction);
				} catch (error) {
					console.error(error);
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		}
	}
});

// HANDLE NON-COMMAND MESSAGES

client.on('messageCreate', async message => {
	bot = await message.author.bot;
	content = await message.content;
	if(!bot && content.split(' ')[0].toLowerCase() == "bot,"){
		choose(message);
	}
	else if(content[0] == "!"){
		command = content.split(" ")[0].replace("!", "").toLowerCase();
		switch(command){
			case "join":
				join(message);
			break;

			case "first":
				first(message);
			break;
		}
	}
});

// FIRST

async function first(message){
	await message.reply(`${message.author.username} was first for... Something! Probably!`);
}

// JOIN

async function join(message){
	const memberRole = await message.guild.roles.cache.find(role => role.name == "Member");
	if(!message.member.roles.cache.has(memberRole.id)){
		await message.member.roles.add(memberRole);
		await message.author.send("Welcome to the fox den!");
	}
	await message.delete();
}

// EIGHT-BALL

eightBallChoices = ["Absolutely", "Probably", "Maybe", "Ask again later", "Not sure", "Probably not", "Definitely not", "Heck yeah",
"01000101 01010010 01010010 01001111 01010010 00111010 00100000 01010100 01101111 01101111 00100000 01100100 01110101 01101101 01100010 00101100 00100000 01100011 01100001 01101110 01101110 01101111 01110100 00100000 01100010 01110010 01100001 01101001 01101110 00101110",
"Up to you"];
restrictedEightballChoices = ["Absolutely", "Probably", "Probably not", "Definitely not", "Heck yeah", "Heck no"];

async function choose(message){
	var seperators = [" or ", ", "];
	var options = (await message.content).replace('?', '').split(new RegExp(seperators.join("|"))).splice(1);
	var choice = options[getRandomInt(options.length)];

	if(choice == undefined){
		choice = "What?";
	}
	else{
		if(options.length == 1){
			choice = eightBallChoices[getRandomInt(eightBallChoices.length)];
		}
		if(options.length <= 2 && (options[0].toLowerCase() == "please" || options[0].toLowerCase() == "pls")){
			choice = restrictedEightballChoices[getRandomInt(restrictedEightballChoices.length)];
		}
	}

	message.channel.send(choice);
}

// UTIL

function getRandomInt(max){
  return Math.floor(Math.random() * max);
}

async function disableComponents(interaction){
	var messageComponents = interaction.message.components;
	for(var i = 0; i < messageComponents.length; i++){
		for(var ii = 0; ii < messageComponents[i].components.length; ii++){
			messageComponents[i].components[ii].setDisabled(true);
		}
	}
	await interaction.message.edit({components: messageComponents});
}