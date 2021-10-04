const mongoose       = require("mongoose"),
	  personneSchema = new mongoose.Schema({
	  	nom: String,
	  	prenom: String,
	  	courriel: String,
	  	nationalite: String,
	  	profession: String,
	  	telephone: String,
	  	rue: String,
	  	num_rue: Number,
		quartier: String,
	  	ville: String,
	  	pays: String,
	  	cin_passport: String,
	  	sexe: Number,
		location: String
	  });
module.exports = mongoose.model("Personne", personneSchema);