const mongoose      = require("mongoose"),
      urgenceSchema = mongoose.Schema({
          nom: String,
          lien: String,
          telephone: String,
          eleve:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Enfant'
          }
      });
module.exports = mongoose.model('Urgence', urgenceSchema);