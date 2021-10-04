const mongoose       = require("mongoose"),
      payementSchema = new mongoose.Schema({
          date_payement: Date,
          type_payement: String,
          eleve:{
              type: mongoose.Schema.Types.ObjectId,
              ref: "Enfant"
          }
      });
module.exports = mongoose.model("Payement", payementSchema);