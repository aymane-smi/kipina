const mongoose         = require("mongoose"),
      impayementSchema = new mongoose.Schema({
          date: Date,
          eleve:{
              type: mongoose.Schema.Types.ObjectId,
              ref: "Enfant"
          }
      });
module.exports = mongoose.model("Imayement", impayementSchema);