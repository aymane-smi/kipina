const mongoose     = require("mongoose"),
      kipinaSchema = mongoose.Schema({
          nom: String,
          nbr_classe: {
              type: Number,
              default: 6
          }
      }); 
module.exports = mongoose.model("Kipina", kipinaSchema);