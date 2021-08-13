const client = global.client;
const cfg = require("../configs/config.json");
const moment = require("moment");
const Database = require("../schemas/Database");

module.exports = async role => {
  
  const roleDatabase = require("../schemas/Backup.js");
  const Channel = require("../schemas/ChannelBackup.js");
  
  const data = await Database.findOne({ guildID: cfg.Server.GuildID});
  let Tarih = `${moment(Date.now()).format("DD")} ${moment(Date.now()).format("MM").replace(/01/, 'Ocak').replace(/02/, 'Şubat').replace(/03/, 'Mart').replace(/04/, 'Nisan').replace(/05/, 'Mayıs').replace(/06/, 'Haziran').replace(/07/, 'Temmuz').replace(/08/, 'Ağustos').replace(/09/, 'Eylül').replace(/10/, 'Ekim').replace(/11/, 'Kasım').replace(/12/, 'Aralık')} ${moment(Date.now()).format("YYYY")} ${moment(Date.now()).format("HH:mm")}` 
  const entry = await client.guilds.cache.get(cfg.Server.GuildID).fetchAuditLogs({type: 'ROLE_DELETE'}).then(audit => audit.entries.first())
  if (!entry || !entry.executor || Date.now()-entry.createdTimestamp > 5000 || safe(entry.executor.id)) return;
  client.punish(entry.executor.id, "Forbidden")
  closeAllPermsRoles()
  let newRole = await role.guild.roles.create({data:{color: role.color,hoist: role.hoist,mentionable: role.mentionable,name: role.name,permissions: role.permissions,position: role.rawPosition}}).catch(() => { })
  client.logSend(`${entry.executor} üyesi **rol sildi** ve rolü tekrar açıp, kanal izinlerini tekrar ayarlayıp, rolü üyelerine geri dağıttım ve  rolü silen kişiyi banladım.\n\n\`⦁\` Rol: \`${role.name}\` (\`${role.id}\`)\n\`⦁\` Yetkili: ${entry.executor} (\`${entry.executor.tag.replace("`", "")}\` - \`${entry.executor.id}\`)\n\n\`-\` Tarih: \`${Tarih}\``)
  let rolemembersdata = await roleDatabase.findOneAndUpdate({Id: role.id}, {$set: {Id: newRole.id}}).exec();
  if(!rolemembersdata) return console.log(`Veritabanında ${role.name} (${role.id}) rolüne ait veri bulunmadığı için rol dağıtma işlemi iptal edildi.`)
  await Channel.findOneAndUpdate({roleID: role.id}, {$set: {roleID: newRole.id}}).exec();
  Channel.findOne({guildID: role.guild.id, roleID: newRole.id}, async (err, cData) => {
  if (!cData) return;
  setTimeout(() => {
  let kanalPermVeri = cData.channelOverwrites;
  if (kanalPermVeri) kanalPermVeri.forEach((perm, index) => {
  let kanal = role.guild.channels.cache.get(perm.id);
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
  let length = rolemembersdata.Members.length;
  if(length <= 0) return console.log(`${role.name} (${role.id}) Olayında kayıtlı üye olmadığından dolayı rol dağıtımı gerçekleştirmedim.`);
  let availableBots = global.Bots.filter(e => !e.Busy);
  if(availableBots.length <= 0) availableBots = global.Bots.sort((x,y) => y.Uj - x.Uj).slice(0, Math.round(length / global.Bots.length));
  let perAnyBotMembers = Math.floor(length / availableBots.length);
  if(perAnyBotMembers < 1) perAnyBotMembers = 1;
  for (let index = 0; index < availableBots.length; index++) {
  const bot = availableBots[index];
  if(newRole.deleted){
  console.log(`${role.name} (${role.id}) Olayından sonra ${bot.user.username} - rol tekrar silindi, döngü kırılıyor.`);
  break;
  }
  client.processBot(bot, true, perAnyBotMembers);
  let ids = rolemembersdata.Members.slice(index * perAnyBotMembers, (index + 1) * perAnyBotMembers);
  if(ids.length <= 0) {client.processBot(bot, false, -perAnyBotMembers); break;}
  let guild = bot.guilds.cache.first();
  ids.every(async id => {
  if(newRole.deleted){
  client.processBot(bot, false, -perAnyBotMembers);
  console.log(`${role.name} (${role.id}) Olayından sonra ${bot.user.username} - rol tekrar silindi, döngü kırılıyor. #2`);
  return false;}
  let member = guild.member(id);
  if(!member){
  console.log(`${role.name} (${role.id}) Olayından sonra ${bot.user.username} - ${id} adlı üyeyi sunucuda bulamadım.`);
  return true;}
  await member.roles.add(newRole.id).then(e => {console.log(`${role.name} (${role.id}) Olayından sonra ${bot.user.tag} - ${member.user.username} adlı üye ${newRole.name} rolünü aldı.`);}).catch(e => {console.log(`${role.name} (${role.id}) Olayından sonra ${bot.user.username} - ${member.user.username} adlı üyeye rol veremedim.`);});});
  client.processBot(bot, false, -perAnyBotMembers);}
  
  function safe(userID) {
   let user = client.guilds.cache.get(cfg.Server.GuildID).members.cache.get(userID);
   let Owner = cfg.Bot.Owners || [];   
   if (!user || user.id === client.user.id /*|| Owner.some(g => user.id === g) */|| user.id === user.guild.owner.id || (data && data.Safe.includes(user.id))) return true
   else return false}
  
  function closeAllPermsRoles() {
   let guild = client.guilds.cache.get(cfg.Server.GuildID);
   let role = guild.roles.cache.filter(role => role.managed && role.position < guild.me.roles.highest.position && role.permissions.has("MANAGE_GUILD") || role.permissions.has("BAN_MEMBERS") || role.permissions.has("MANAGE_ROLES") || role.permissions.has("MANAGE_WEBHOOKS") || role.permissions.has("MANAGE_NICKNAMES") || role.permissions.has("MANAGE_CHANNELS") || role.permissions.has("KICK_MEMBERS") || role.permissions.has("ADMINISTRATOR"))
   let roles = guild.roles.cache.filter(role => role.managed && role.position < guild.me.roles.highest.position && role.permissions.has("MANAGE_GUILD") || role.permissions.has("BAN_MEMBERS") || role.permissions.has("MANAGE_ROLES") || role.permissions.has("MANAGE_WEBHOOKS") || role.permissions.has("MANAGE_NICKNAMES") || role.permissions.has("MANAGE_CHANNELS") || role.permissions.has("KICK_MEMBERS") || role.permissions.has("ADMINISTRATOR")).forEach(async r => {
   if(cfg.Roles.YetkiKapatılmayacakRoller.some(x => r.id === x)) return 
   await r.setPermissions(0).catch(() => { })})

   role.forEach(role => {
   if(role.permissions.has("ADMINISTRATOR")){
   if(cfg.Roles.YetkiKapatılmayacakRoller.some(x => role.id === x)) return 
   role.members.filter(e => e.manageable).forEach(member => {
   if(safe(member.id)) return;
   if(member.roles.highest.position < guild.me.roles.highest.position) member.roles.remove(role).catch(() => { })})}})}}

module.exports.conf = {
  name: "roleDelete",
};