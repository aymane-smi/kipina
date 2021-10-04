const mongoose      = require("mongoose"),
	  localmongoose = require("passport-local-mongoose");
const userSchema = new mongoose.Schema({
	photo_profile: {
		type:String,
		default: "test-image"
	},
	nom: String,
	prenom: String,
	role: String,
	location: String
});
userSchema.plugin(localmongoose);
module.exports = mongoose.model("User",userSchema);