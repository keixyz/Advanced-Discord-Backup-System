const fs = require("fs");
const client = global.client;
fs.readdir("./src/commands", (err, files, komutlar = []) => {
  console.log("Komutlar Yükleniyor.");
	if (err) console.error(err);
	files.forEach((f) => {
	let props = require(`../commands/${f}`);
	client.commands.set(props.conf.name, props);
	props.conf.aliases.forEach((alias) => {
	client.aliases.set(alias, props.conf.name);
	});
	});
  for (var value of client.commands.values()) komutlar.push(value.conf.name);
  console.log("[" + komutlar.join(", ") + "]" + " isimli komut(lar) yüklendi. (" + files.length + ")");
  console.log("--------------------------");
});
