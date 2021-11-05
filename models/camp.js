const mongoose = require("mongoose"),
    campSchema = new mongoose.Schema({
        nom: String,
        nbr_jrs: Number,
        location: String,
        type_camp: Number,
        fini:{
            type: Boolean,
            default: false
        },
        date_creation:{
            type: Date,
            default: Date.now
        }
    });
module.exports = mongoose.model("Camp", campSchema);