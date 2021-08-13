const { Schema, model } = require("mongoose");

const schema = new Schema({
    guildID: { type: String, default: "" },
    Id: String,
    name: String,
    color: String,
    hoist: Boolean,
    position: Number,
    permler: Number,
    mentionable: Boolean,
    Members: {type: Array, default: []}
});

module.exports = model("backupfenice", schema);