const mongoose         = require("mongoose"),
      historiqueSchema = new mongoose.Schema({
          nom: String,
          prenom: String,
          date_inscription: Date,
          date_quitte: Date,
          choix: [String],
          autre: String
      });
module.exports = mongoose.model("Historique", historiqueSchema);