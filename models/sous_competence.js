const mongoose  = require("mongoose"),
      s_cSchema = new mongoose.Schema({
          nom: String,
          location: String
      }); 
module.exports = mongoose.model("Sous_competence", s_cSchema);