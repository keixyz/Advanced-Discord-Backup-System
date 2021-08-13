const { Schema, model } = require("mongoose");

const schema = new Schema({
    guildID: { type: String, default: "" },
    Safe: Array,
});

module.exports = model("databasefenice", schema);