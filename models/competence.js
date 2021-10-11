const mongoose         = require("mongoose"),
      CompetenceSchema = new mongoose.Schema({
          competence: String,
          domaine_competence: Number,
          sous_domaine: String,
          image_competence: String,
          eleve: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Enfant"
          }
      });
module.exports = mongoose.model("Competence", CompetenceSchema);