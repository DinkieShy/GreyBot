const discord = require("discord.js"); //Discord.js npm
const client = new discord.Client(); //The client variable for the bot
const auth = require("./secret/auth.json"); //The auth token the bot uses to log in, found in auth.json
const fs = require("fs"); //This lets the bot read and write files
const emojis = require("./emojis.json"); //The bot needs emojis and every one of them is a butt

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
});