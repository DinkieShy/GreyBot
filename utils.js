const fs = require("fs");
const path = require("path");

module.exports = {
	getCurrentMonth(){
		const actualDate = new Date();
		const date = new Date(actualDate.getTime() - 8*60*60*1000)
		return date.getMonth();
	},
	async loadFile(filename){
		var contents = [];
		const filepath = path.join(__dirname, `../storage/${filename}.json`);
		try{
			contents = JSON.parse(fs.readFileSync(filepath));
		}
		catch(error){
			console.log(error);
		}
		return contents;
	},
	async saveFile(filename, contents){
		const filepath = path.join(__dirname, `../storage/${filename}.json`);
		try{
			fs.writeFileSync(filepath, JSON.stringify(contents));
		}
		catch(error){
			console.log(error);
		}
	}
}
