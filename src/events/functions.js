module.exports = async(client, cfg, moment, Discord, request) => {
  
  client.Colors = new Array("#6959cd","#1f0524", "#0b0067", "#4a0038", "#07052a", "#FFDF00", "#00FFFF", "#0091CC", "#0047AB", "#384B77", "#ffffff", "#000000", "#04031a", "#f9ffba");
  const Log = new Discord.WebhookClient(cfg.Webhook.LogWebhook.ID, cfg.Webhook.LogWebhook.Token);
  
   client.normalEmbed = (message, msj) => {
     return {
       embed: {
         description: message,
         author: { name: msj.guild.member(msj.author).displayName, icon_url: msj.author.avatarURL({dynamic: true}) },
         color: client.Colors[Math.floor(Math.random() * client.Colors.length)],}}}
   
   client.logSend = (content) => {
     const logEmbed = new Discord.MessageEmbed().setThumbnail(client.guilds.cache.get(cfg.Server.GuildID).iconURL({dynamic: true})).setDescription(content).setAuthor(client.guilds.cache.get(cfg.Server.GuildID).name, client.guilds.cache.get(cfg.Server.GuildID).iconURL({dynamic: true})).setColor(client.Colors[Math.floor(Math.random() * client.vegasRenkler.length)])
     Log.send(logEmbed).catch(() => { })}
  
  client.timemessage = (content, Channel, timeout) => {
   const channel = client.channels.cache.get(Channel)
   if (channel) channel.send(content).then((msg) => msg.delete({ timeout: timeout })).catch(() => { });};
  
  client.message = (content, Channel) => {
   const channel = client.channels.cache.get(Channel);
   if (channel) channel.send(content).catch(() => { });};
  
  client.setRole = (oldRole, newRole) => {
   newRole.edit({ ...oldRole });};
  
  client.deleteRole = (role) => {
   role.delete({reason: "Role Guard"}).catch(() => { })}
  
  client.processBot = (bot, busy, job, equal = false) => {
   bot.Busy = busy;
   if(equal) bot.Uj = job;
   else bot.Uj += job;
   let index = global.Bots.findIndex(e => e.user.id == bot.user.id);
   global.Bots[index] = bot;}
   client.giveBot = (length) => {
   if(length > global.Bots.length) length = global.Bots.length;
   let availableBots = global.Bots.filter(e => !e.Busy);
   if(availableBots.length <= 0) availableBots = global.Bots.sort((x,y) => x.Uj - y.Uj).slice(0, length);
   return availableBots;}
  
  client.backup = () => {
    const Database = require("../schemas/Backup.js");
    Database.deleteMany({});
    client.guilds.cache.get(cfg.Server.GuildID).roles.cache.filter(e => !e.managed).forEach(async role => {
    new Database({
      guildID: client.guilds.cache.get(cfg.Server.GuildID).id,
      Id: role.id,
      name: role.name,
      color: role.hexColor,
      hoist: role.hoist,
      position: role.rawPosition,
      permler: role.permissions,
      mentionable: role.mentionable,
      Members: role.members.map(e => e.id)}).save()})
    let rolsize = client.guilds.cache.get(cfg.Server.GuildID).roles.cache.filter(rls => rls.name !== "@everyone").size
    console.log(`Başarıyla sunucuda ki ${rolsize} rolün yedeği alındı!`)}
  
  client.channelBackup = () => {
   const channelDatabase = require("../schemas/ChannelBackup.js");
   channelDatabase.deleteMany({});
   let roleChannelOverwrites = [];
   let guild = client.guilds.cache.get(cfg.Server.GuildID);
   let kanalsize = client.guilds.cache.get(cfg.Server.GuildID).channels.cache.filter(chnls => chnls.name !== "@everyone").size
   if (guild) {
    guild.roles.cache.filter(r => r.name !== "@everyone" && !r.managed).forEach(role => {
   let roleChannelOverwrites = [];
    guild.channels.cache.filter(c => c.permissionOverwrites.has(role.id)).forEach(c => {
   let channelPerm = c.permissionOverwrites.get(role.id);
   let pushlanacak = { id: c.id, allow: channelPerm.allow.toArray(), deny: channelPerm.deny.toArray() };
    roleChannelOverwrites.push(pushlanacak);});
    new channelDatabase({
      guildID: client.guilds.cache.get(cfg.Server.GuildID).id,
      roleID: role.id,
      channelOverwrites: roleChannelOverwrites}).save()})}
   console.log(`Başarıyla sunucuda ki ${kanalsize} kanalın yedeği alındı!`)}
      
  client.punish = (userID, tür) => {
   let user = client.guilds.cache.get(cfg.Server.GuildID).members.cache.get(userID);
   if (!user) return;
   if (tür == "Suspended") return user.roles.cache.has(cfg.Roles.Booster) ? user.roles.set([cfg.Roles.Booster, cfg.Roles.Jail]) : user.roles.set([cfg.Roles.Jail]).catch(() => { });
   if (tür == "Forbidden") return user.ban({ reason: "Role Guard" }).catch(() => { })}}

