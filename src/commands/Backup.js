const moment = require("moment");
module.exports = {
  conf: {
    aliases: ["kur","rolebackup","kurulum"],
    name: "backup",
    serverowner: true
  },

  run: async ({client, msg, args, guild, cfg, fs, prefix}) => {
   
   const Database = require("../schemas/Backup.js");
   const channelDatabase = require("../schemas/ChannelBackup.js");
   const dataa = await Database.findOne({ guildID: guild});
   let dataxd = await Database.findOne({Id: args[0]})
   if(!dataa) return client.timemessage(client.normalEmbed(`Veritabanında rol verisi bulunamadı.`, msg), msg.channel.id, 10000)
   if (!args[0] || isNaN(args[0])) return client.timemessage(client.normalEmbed(`Lütfen tüm argümanları doğru giriniz!\nÖrnek Kullanım: ${prefix}backup {rol}`, msg), msg.channel.id, 10000);
   client.timemessage(client.normalEmbed(`Başarıyla rolü yeniden kurdunuz.`, msg), msg.channel.id, 10000)
   let newRole = await msg.guild.roles.create({data: {name: dataxd.name,color: dataxd.color,hoist: dataxd.hoist,permissions: dataxd.permissions,position: dataxd.position,mentionable: dataxd.mentionable},reason: "Backup atıldı."})
   let data = await Database.findOneAndUpdate({Id: args[0]}, {$set: {Id: newRole.id}}).exec();
   if(!data) return client.timemessage(client.normalEmbed(`\`${data.name}\` (\`${data.id}\`) rolünde veri olmadığı için işlem iptal edildi.`, msg), msg.channel.id, 10000)
   await channelDatabase.findOneAndUpdate({roleID: args[0]}, {$set: {roleID: newRole.id}}).exec();
   channelDatabase.findOne({guildID: msg.guild.id, roleID: newRole.id}, async (err, cData) => {
   if (!cData) return;
   setTimeout(() => {
   let kanalPermVeri = cData.channelOverwrites;
   if (kanalPermVeri) kanalPermVeri.forEach((perm, index) => {
   let kanal = msg.guild.channels.cache.get(perm.id);
   if (!kanal) return;
   setTimeout(() => {
   let yeniKanalPermVeri = {};
   perm.allow.forEach(p => {
   yeniKanalPermVeri[p] = true;});
   perm.deny.forEach(p => {
   yeniKanalPermVeri[p] = false;});
   kanal.createOverwrite(newRole, yeniKanalPermVeri).catch(console.error);
   }, index*5000)})
   }, 5000)})
  let length = data.Members.length;
  if(length <= 0) return console.log(`[${args[0]}] Olayında kayıtlı üye olmadığından dolayı rol dağıtımı gerçekleştirmedim.`);
  let availableBots = Bots.filter(e => !e.Busy);
  if(availableBots.length <= 0) availableBots = Bots.sort((x,y) => y.Uj - x.Uj).slice(0, Math.round(length / Bots.length));
  let perAnyBotMembers = Math.floor(length / availableBots.length);
  if(perAnyBotMembers < 1) perAnyBotMembers = 1;
  for (let index = 0; index < availableBots.length; index++) {
  const bot = availableBots[index];
  client.processBot(bot, true, perAnyBotMembers);
  let ids = data.Members.slice(index * perAnyBotMembers, (index + 1) * perAnyBotMembers);
  if(ids.length <= 0) {client.processBot(bot, false, -perAnyBotMembers); break;}
  let guild = bot.guilds.cache.first();
  ids.every(async id => {
  let member = guild.member(id);
  if(!member){
  console.log(`[${args[0]}] Olayından sonra ${bot.user.username} - ${id} adlı üyeyi sunucuda bulamadım.`);
  return true;}
  await member.roles.add(newRole.id).then(e => {console.log(`[${args[0]}] Olayından sonra ${bot.user.tag} - ${member.user.username} adlı üye ${newRole.name} rolünü aldı.`);}).catch(e => {console.log(`[${newRole.id}] Olayından sonra ${bot.user.username} - ${member.user.username} adlı üyeye rol veremedim.`);});});
  client.processBot(bot, false, -perAnyBotMembers);}}}