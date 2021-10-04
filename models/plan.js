const mongoose = require("mongoose"),
    planSchema = new mongoose.Schema({
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        file: String
    });
module.exports = mongoose.model("Plan", planSchema);