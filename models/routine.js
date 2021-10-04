const mongoose      = require("mongoose"),
      jour          = new mongoose.Schema({
        t_pm: Number,
        t_am: Number,
        dodo: Number,
        repas: Number,
        selle: Number
      }),
      routineSchema = new mongoose.Schema({
          lundi: jour,
          mardi: jour,
          mercredi: jour,
          jeudi: jour,
          vendredi: jour,
          eleve: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Enfant"
          }
      });

module.exports = mongoose.model("Routine", routineSchema);