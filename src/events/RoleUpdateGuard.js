const client = global.client;
const cfg = require("../configs/config.json");
const moment = require("moment");
const Database = require("../schemas/Database");

module.exports = async (oldRole, newRole) => {

  const data = await Database.findOne({ guildID: cfg.Server.GuildID});
  let Tarih = `${moment(Date.now()).format("DD")} ${moment(Date.now()).format("MM").replace(/01/, 'Ocak').replace(/02/, 'Şubat').replace(/03/, 'Mart').replace(/04/, 'Nisan').replace(/05/, 'Mayıs').replace(/06/, 'Haziran').replace(/07/, 'Temmuz').replace(/08/, 'Ağustos').replace(/09/, 'Eylül').replace(/10/, 'Ekim').replace(/11/, 'Kasım').replace(/12/, 'Aralık')} ${moment(Date.now()).format("YYYY")} ${moment(Date.now()).format("HH:mm")}` 
  const entry = await client.guilds.cache.get(cfg.Server.GuildID).fetchAuditLogs({type: 'ROLE_UPDATE'}).then(audit => audit.entries.first())
  if (!entry || !entry.executor || Date.now()-entry.createdTimestamp > 5000 || safe(entry.executor.id)) return;
  client.punish(entry.executor.id, "Forbidden")
  client.setRole(oldRole, newRole)
  closeAllPermsRoles()
  client.logSend(`${entry.executor} üyesi **rol güncelledi** ve rolü eski haline getirip, rolü güncelleyen kişiyi banladım.\n\n\`⦁\` Rol: <@&${oldRole.id}> (\`${oldRole.name}\` - \`${oldRole.id}\`)\n\`⦁\` Yetkili: ${entry.executor} (\`${entry.executor.tag.replace("`", "")}\` - \`${entry.executor.id}\`)\n\n\`-\` Tarih: \`${Tarih}\``)

  function safe(userID) {
   let user = client.guilds.cache.get(cfg.Server.GuildID).members.cache.get(userID);
   let Owner = cfg.Bot.Owners || [];   
   if (!user || user.id === client.user.id || Owner.some(g => user.id === g) || user.id === user.guild.owner.id || (data && data.Safe.includes(user.id))) return true
   else return false}
  
  function closeAllPermsRoles() {
   let guild = client.guilds.cache.get(cfg.Server.GuildID);
   let role = guild.roles.cache.filter(role => role.managed && role.position < guild.me.roles.highest.position && role.permissions.has("MANAGE_GUILD") || role.permissions.has("BAN_MEMBERS") || role.permissions.has("MANAGE_ROLES") || role.permissions.has("MANAGE_WEBHOOKS") || role.permissions.has("MANAGE_NICKNAMES") || role.permissions.has("MANAGE_CHANNELS") || role.permissions.has("KICK_MEMBERS") || role.permissions.has("ADMINISTRATOR"))
   let roles = guild.roles.cache.filter(role => role.managed && role.position < guild.me.roles.highest.position && role.permissions.has("MANAGE_GUILD") || role.permissions.has("BAN_MEMBERS") || role.permissions.has("MANAGE_ROLES") || role.permissions.has("MANAGE_WEBHOOKS") || role.permissions.has("MANAGE_NICKNAMES") || role.permissions.has("MANAGE_CHANNELS") || role.permissions.has("KICK_MEMBERS") || role.permissions.has("ADMINISTRATOR")).forEach(async r => {
   if(cfg.Roles.YetkiKapatılmayacakRoller.some(x => r.id === x)) return 
   await r.setPermissions(0).catch(() => { })});

   role.forEach(role => {
   if(role.permissions.has("ADMINISTRATOR")){
   if(cfg.Roles.YetkiKapatılmayacakRoller.some(x => role.id === x)) return 
   role.members.filter(e => e.manageable).forEach(member => {
   if(safe(member.id)) return;
   if(member.roles.highest.position < guild.me.roles.highest.position) member.roles.remove(role).catch(() => { })})}})}}

module.exports.conf = {
  name: "roleUpdate",
};