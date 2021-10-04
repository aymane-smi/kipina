const mongoose = require("mongoose"),
    campSchema = new mongoose.Schema({
        location: String,
        eleve:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Enfant"
        }]
    });
module.exports = mongoose.model("English", campSchema);