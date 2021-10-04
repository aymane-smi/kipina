const mongoose      = require("mongoose"),
      sessionSchema = mongoose.Schema({
        preference: [{type:Number}],
        eleve: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Enfant'
        }
      }); 
module.exports = mongoose.model("Session", sessionSchema);