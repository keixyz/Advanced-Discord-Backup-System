const { Schema, model } = require("mongoose");

const schema = new Schema({
    guildID: String,
    roleID: String,
    channelOverwrites: Array
});

module.exports = model("channelbackupfenice", schema);