const discord = require("discord.js"); //Discord.js npm
const client = new discord.Client(); //The client variable for the bot
const auth = require("./secret/auth.json"); //The auth token the bot uses to log in, found in auth.json
const fs = require("fs"); //This lets the bot read and write files
const emojis = require("./emojis.json"); //The bot needs emojis and every one of them is a butt

const prefix = "!";

testMode = false;
if(process.platform == "win32") testMode = true;

if(testMode){
	client.login(auth.testToken).catch(function(err){
    console.log(err);
    process.exit();
  });
}
else{
	client.login(auth.token).catch(function(err){
    console.log(err);
    process.exit();
  });
}

console.log("Loaded!");

client.on("ready", function(){
  console.log(`Logged in as ${client.user.tag}`);

  loadRoles();
});

client.on("message", function(msg){
	if(msg.content[0] == prefix){
		command = msg.content.split(" ")[0].slice(1, msg.content.length);
		
		console.log(command);
		switch(command){
			case "ping":
				ping(msg);
			break;

			case "help":
				help(msg);
			break;

			case "roles":
				menu("Which roles would you like?", managedRoles, msg, roles);
			break;

			case "pronouns":
				menu("Which pronouns would you like?", managedPronouns, msg, pronouns);
			break;

			case "managepronouns":
				managePronouns(msg);
			break;

			case "manageroles":
				manageRoles(msg);
			break;

			case 'restart':
        if(message.channel.guild.members.cache.get(message.author.id).roles.cache.find(item => item.name == "Admin") != undefined){
          message.channel.send("Shutting down...");
          savePatreon();
          savePolls();
          savePlayers();
          client.destroy();
          process.exit();
        }
      break;

		}
	}
});

//async function menu(question, options, message, doneFunction, offset = 0, responses = [], parameters = []){

//Pronoun selection

managedPronouns = ["they/them", "she/her", "he/him", "she/they", "he/they"];

function loadPronouns(){
	try{
		managedPronouns = JSON.parse(fs.readFileSync("./storage/managedPronouns.json"));
	}
	catch(error){
		console.log(error);
		managedPronouns = ["they/them", "she/her", "he/him", "she/they", "he/they"];
	}
}

function savePronouns(){
	fs.writeFileSync("./storage/managedPronouns.json", JSON.stringify(managedPronouns));
}

function managePronouns(msg){
	pronounsToChange = msg.content.split(" ").slice(1);
	for(i = 0; i < pronounsToChange.length; i++){
		nextPronoun = msg.guild.roles.cache.find(item => item.name.toLowerCase() == pronounsToChange[i].toLowerCase());
		if(nextPronoun != undefined){
			if(managedPronouns.includes(nextPronoun.name)){
				managedPronouns.splice(managedPronouns.indexOf(nextPronoun.name), 1);
				msg.channel.send(`Removed ${nextPronoun.name} from the list of managed roles`);
			}
			else{
				managedPronouns.push(nextPronoun.name);
				msg.channel.send(`Added ${nextPronoun.name} to the list of managed roles`);
			}
		}
	}
	savePronouns();
}

function pronouns(responses, msg){
	resolvedToAdd = [];
	resolvedToRemove = [];
	userPronouns = msg.member.roles.cache; //List of roles the user has
	managedResolved = []; //List of roles we're managing

	for(i = 0; i < managedPronouns.length; i++){
		resolvedRole = msg.guild.roles.cache.find(item => item.name == managedPronouns[i]);
		if(resolvedRole != undefined){
			managedResolved.push(resolvedRole);
		}
		else{
			managedPronouns.splice(i, 1);
		}
	}

	for(i = 0; i < managedResolved.length; i++){ //Iterate through the roles we manage
		nextPronoun = managedResolved[i];
		userHasRole = userPronouns.find(item => item.name == nextPronoun.name) != undefined;
		if(responses.includes(i)){ 
			if(!userHasRole){
				resolvedToAdd.push(nextPronoun);
			}
		}
		else if(userHasRole){
			//if user has role
			resolvedToRemove.push(nextPronoun);
		}
	}

	removeRole(resolvedToRemove, msg).then(function(){
		addRole(resolvedToAdd, msg);
	});
}

//Role selection

managedRoles = [];

function loadRoles(){
	try{
		managedRoles = JSON.parse(fs.readFileSync("./storage/managedRoles.json"));
	}
	catch(error){
		console.log(error);
		managedRoles = ["Stream Pings", "testRole1", "testRole2"];
	}
}

function saveRoles(){
	fs.writeFileSync("./storage/managedRoles.json", JSON.stringify(managedRoles));
}

function manageRoles(msg){
	rolesToChange = msg.content.split(" ").slice(1);
	for(i = 0; i < rolesToChange.length; i++){
		nextRole = msg.guild.roles.cache.find(item => item.name.toLowerCase() == rolesToChange[i].toLowerCase());
		if(nextRole != undefined){
			if(managedRoles.includes(nextRole.name)){
				managedRoles.splice(managedRoles.indexOf(nextRole.name), 1);
				msg.channel.send(`Removed ${nextRole.name} from the list of managed roles`);
			}
			else{
				managedRoles.push(nextRole.name);
				msg.channel.send(`Added ${nextRole.name} to the list of managed roles`);
			}
		}
	}
	saveRoles();
}

function roles(responses, msg){
	resolvedToAdd = [];
	resolvedToRemove = [];
	userRoles = msg.member.roles.cache; //List of roles the user has
	managedResolved = []; //List of roles we're managing

	for(i = 0; i < managedRoles.length; i++){
		resolvedRole = msg.guild.roles.cache.find(item => item.name == managedRoles[i]);
		if(resolvedRole != undefined){
			managedResolved.push(resolvedRole);
		}
		else{
			managedRoles.splice(i, 1);
		}
	}

	for(i = 0; i < managedResolved.length; i++){ //Iterate through the roles we manage
		nextRole = managedResolved[i];
		userHasRole = userRoles.find(item => item.name == nextRole.name) != undefined;
		if(responses.includes(i)){ 
			if(!userHasRole){
				resolvedToAdd.push(nextRole);
			}
		}
		else if(userHasRole){
			//if user has role
			resolvedToRemove.push(nextRole);
		}
	}

	removeRole(resolvedToRemove, msg).then(function(){
		addRole(resolvedToAdd, msg);
	});
}

function addRole(roleToAdd, msg){
	promise = msg.member.roles.add(roleToAdd);
	if(roleToAdd.length > 0){
		if(roleToAdd.length == 1){
			msg.channel.send("Added 1 role!");
		}
		else{
			msg.channel.send(`Added ${roleToAdd.length} roles!`);
		}
	}
	return promise;
}

function removeRole(roleToRemove, msg){
	promise = msg.member.roles.remove(roleToRemove);
	if(roleToRemove.length > 0){
		if(roleToRemove.length == 1){
			msg.channel.send("Removed 1 role!");
		}
		else{
			msg.channel.send(`Removed ${roleToRemove.length} roles!`);
		}
	}
	return promise;
}

async function menu(question, options, message, doneFunction, offset = 0, responses = [], parameters = []){
  var embed = {
    title: question,
    fields: [],
    footer:{text:""}
  }
  for(var i = offset; i < options.length && i < offset + 5; i++){
    embed.fields.push({"name":"**" + (i - offset + 1) + ":**","value":options[i]});
  }
  message.channel.send({embed}).then(async function(newMessage){
    var done;
    var filter = (reaction, user) => user.id == message.author.id
    var collector = newMessage.createReactionCollector(filter);
    collector.on('collect', r => {
      if(r.emoji.name == emojis["white_check_mark"]){
        done = true;
        collector.stop();
      }
      else if(r.emoji.name == emojis["arrow_right"]){
        done = false;
        collector.stop();
        menu(question, options, message, doneFunction, offset+5, responses, parameters);
      }
      else if(r.emoji.name == emojis["arrow_left"]){
        done = false;
        collector.stop();
        menu(question, options, message, doneFunction, offset-5, responses, parameters);
      }
      else if(responses.indexOf(parseInt(r.emoji.identifier[0])-1+offset) == -1){
        responses.push(parseInt(r.emoji.identifier[0])-1+offset);
      }
    });
    collector.on('dispose', function(r){
    	console.log("Reaction removed!");
    	index = responses.indexOf(parseInt(r.emoji.identifier[0])-1+offset);
    	if(index != -1){
        responses.splice(index, 1);
      }
    });
    collector.on('end', function(){
      if(done){
				if(parameters == []){
        	doneFunction(responses, message);
				}
				else{
					doneFunction(responses, message, parameters);
				}
      }
      newMessage.delete();
    });
    try{
	    if(offset - 5 >= 0){
	      await newMessage.react(emojis["arrow_left"]);
	    }
	    for(var i = offset; i < options.length && i < offset + 5;){
	      await newMessage.react((i-offset+1).toString() + "%E2%83%A3").then(i++);
	    }
	    if(options.length > offset + 5){
	      await newMessage.react(emojis["arrow_right"]);
	    }
    	done = await newMessage.react(emojis["white_check_mark"]).catch(console.error);
	  }
	  catch(DiscordAPIError){
	  	//Message probably deleted, no biggie, just stop trying to do that
	  	return
	  }
  });
}

function ping(msg){
	msg.channel.send("Pong!");
}

function help(msg){
	msg.channel.send("I don't know ;-;");
}
