const mongoose         = require("mongoose"),
      CompetenceSchema = new mongoose.Schema({
          enfant: String,
          img1: [String],
          non_img1: [String],
          description1: [String],
          //
          img2: [String],
          non_img2: [String],
          description2: [String],
          //
          img3: [String],
          non_img3: [String],
          description3: [String],
          //
          img4: [String],
          non_img4: [String],
          description4: [String],
          //
          img5: [String],
          non_img5: [String],
          description5: [String],
          //
          img6: [String],
          non_img6: [String],
          description6: [String],
          //
          eleve: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Enfant"
          }
      });
module.exports = mongoose.model("Competence", CompetenceSchema);