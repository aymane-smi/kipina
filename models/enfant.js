const mongoose     = require("mongoose"),
      enfantSchema = mongoose.Schema({
      	nom: String,
      	prenom: String,
      	date_naissance: {
      		type:Date
      		// min: '2019-01-01',
    		//       max: '2016-01-01'
      	},
      	lieu_naissance: String,
      	sexe: Number,
      	nationnalite: String,
      	langue_maternelle: String,
      	langues_parlees: [String],
      	pere: {
      		type: mongoose.Schema.Types.ObjectId,
      		ref: "Personne"
      	},
      	mere: {
      		type: mongoose.Schema.Types.ObjectId,
      		ref: "Personne"
      	},
      	image: String,
		location: String,
		classe: Number,
		type_eleve: Number,
		payement: Boolean,
		forfait: Boolean,
		type_forfait: [Number],
		transport: Boolean,
		type_transport: Number,
		gardes: Boolean,
		gardes_type: [Number],
		mercredi: Boolean,
		personnel: Boolean,
		cantine: Boolean,
		gouter:Boolean,
		type_cantine: Number,
		sm: Boolean,
		inscription:{
			type:Boolean,
			default: false
		},
		type_scolarite:{
			type: Number,
			default: 1
		},
		store:{
			type: Boolean,
			default: false
		}
      });
module.exports = mongoose.model("Enfant", enfantSchema);
//pays_origine, session, personne_urg(), medicaux(class), 