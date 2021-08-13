const { Client, Collection } = require("discord.js");
const Discord = require("discord.js");
const client = (global.client = new Client({ fetchAllMembers: true }));
const request = require("request");
const logs = require('discord-logs');
logs(client);
const cfg = require("./src/configs/config.json");
const moment = require("moment");
const mongo = require("mongoose");
require("moment-duration-format")
client.commands = global.commands = new Collection();
client.aliases = new Collection();
client.cooldown = new Map();

require("./src/handlers/commandHandler");
require("./src/handlers/eventHandler");
require("./src/handlers/mongoHandler");
require("./src/events/functions.js")(client, cfg, moment, Discord, request); 

let Tokens = cfg.Bot.DestekçiToken;
let danger = false;
const Bots = global.Bots = [];

Tokens.forEach(token => {
 let bot = new Client();
  bot.on("ready", () => {
  console.log(`(${bot.user.username}) adlı destekçi hesapta [${bot.guilds.cache.get(cfg.Server.GuildID).name}] adlı sunucuda giriş yapıldı.`);
  bot.user.setPresence({ activity: { name: cfg.Bot.DestekçiDurum }, status: cfg.Bot.DestekçiStatus});
  bot.Busy = false;
  bot.Uj = 0;
  Bots.push(bot);})
  bot.login(token).then(e => {}).catch(e => {console.error(`${token.substring(Math.floor(token.length / 2))} adlı bota giriş yapılırken başarısız olundu!.`)})})

client.login(cfg.Bot.Token).catch(err => console.error("Bota giriş yapılırken başarısız olundu!"));
