const mongoose       = require("mongoose"),
      camp_eleveSchema = new mongoose.Schema({
        camp: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Camp"
        },
        eleve:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Enfant"
            }
        ]
    }); 
module.exports = mongoose.model("Camp_eleve", camp_eleveSchema);