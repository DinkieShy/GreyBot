
TEST_MODE = true;

const {Client, Collection, GatewayIntentBits, REST, Routes} = require('discord.js');
const fs = require('fs');

const {getRandomInt, disableComponents} = require("./utils.js");

const auth = require("./secret/auth.json");
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildPresences,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.MessageContent] });

// LOGIN / AUTHENTICATE

client.once('ready', () => {
	console.log('Ready!');
	console.log(`Logged in as ${client.user.tag}!`);

	client.commands = new Collection();
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		client.commands.set(command.data.name, command);
	}
});

var token = auth.token;
var GUILD_ID = auth.guild;
var CLIENT_ID = auth.clientID;
if(TEST_MODE){
	token = auth.testToken;
	GUILD_ID = auth.testGuild;
	CLIENT_ID = auth.testClientID;
}

client.login(token);

// SET UP COMMANDS

async function deployCommands(){
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	const commands = [];

	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		commands.push(command.data.toJSON());
	}

	const rest = new REST().setToken(token);

	try{
		console.log("Refreshing application commands");
		const data = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
		console.log(`Successfully registered ${data.length} application commands.`);
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
		if(interaction.isStringSelectMenu()){
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

			case "deploycommands":
				deployCommands();
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
