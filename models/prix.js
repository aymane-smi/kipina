const mongoose   = require("mongoose"),
      prixSchema = new mongoose.Schema({
          inscription:{
              type: Number,
              default: 6000
          },
          scolarite_ancien:{
              type: Number,
              default: 3200
          },
          scolarite_nv:{
              type: Number,
              default: 3400
          },
          cantine4:{
              type:Number,
              default: 750
          },
          cantine5:{
              type:Number,
              default: 820
          },
          cantine_unitaire:{
            type: Number,
            default: 55
          },
          garde:{
              type: Number,
              default: 300,
          },
          mercredi:{
              type:Number,
              default: 300
          },
          mercredi_unitaire:{
            type: Number,
            default: 100
          },
          aller_retour:{
              type: Number,
              default: 750
          },
          trajet:{
              type: Number,
              default: 450
          },
          trajet_unitaire:{
              type: Number,
              default: 75
          },
          remise:{
            type: Number,
            default: 15
        },
          location: String
      });
module.exports = mongoose.model("Prix", prixSchema);