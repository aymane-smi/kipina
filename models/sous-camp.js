const mongoose       = require("mongoose"),
      sousCampSchema = new mongoose.Schema({
          camp: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Camp"
          },
          date_creation: {
              type: Date,
              default: Date.now()
          },
          fini:{
            type: Boolean,
            default: false
        }
      });
module.exports = mongoose.model("Sous_camp", sousCampSchema);