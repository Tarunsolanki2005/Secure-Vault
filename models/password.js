const mongoose = require("mongoose");

const passwordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    website: String,
    username: String,
    password: String
});

module.exports = mongoose.model("Password", passwordSchema);