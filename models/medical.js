const mongoose      = require("mongoose"),
      medicalSchema = mongoose.Schema({
        nom: String,
        adresse_medcine: String,
        // adresse_clinique: String,
        telephone: String,
        prob_sante: Boolean,
        type_prob: {
		    type:String,
		    default: null
		},
		type_maladie:[
			{type:String}
		],
        maladie_desc: {
			type:String,
			default: null
		},
        accident_desc: {
			type:String,
			default: null
		},
        allergie_desc: {
			type:String,
			default: null
		},
		medica: Boolean,
        medica_desc:{
			type:String,
			default: null
		},
        medica_horaires:{
			type:String,
			default: null
		},
		info_plus:{
			type:String,
			default: null
		},
        eleve:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Enfant'
        }
      });
module.exports = mongoose.model('Medical', medicalSchema);