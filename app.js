const { render } = require("ejs");
const { create, find } = require("./models/camp_eleve");
const competence = require("./models/competence");
const historique = require("./models/historique");

//variables
const express = require("express"),
  app = express(),
  user = require("./models/user"),
  Sanitizer = require("express-sanitizer"),
  passport = require("passport"),
  local = require("passport-local"),
  mongoose = require("mongoose"),
  localmongoose = require("passport-local-mongoose"),
  multer = require("multer"),
  sous_camp = require("./models/sous-camp"),
  upload = multer({ dest: "./public/files/avatar/" }),
  BodyParser = require("body-parser"),
  enfant = require("./models/enfant"),
  personne = require("./models/personne"),
  urgence = require("./models/urgence"),
  medical = require("./models/medical"),
  camp    = require("./models/camp"),
  camp_eleve = require("./models/camp_eleve"),
  immpaye = require("./models/impaye"),
  routine = require("./models/routine"),
  payement = require("./models/payement"),
  kipina = require("./models/kipina"),
  english = require("./models/english"),
  impaye =require("./models/impaye"),
  plan = require("./models/plan"),
  sous_competence = require("./models/sous_competence"),
  pdf = require("html-pdf"),
  prix = require("./models/prix"),
  flash = require("connect-flash"),
  AccessMiddleware = require("./middleware/index"),
  mongo_url =
    "mongodb+srv://tester:p7dJ3dFR3xBXvOWI@cluster0.b4bpq.mongodb.net/test?retryWrites=true";

//configuration
// mongodb://localhost/kipina

mongoose.connect(mongo_url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(BodyParser.urlencoded({ extended: false }));
app.use(BodyParser.json());
mongoose.set("useFindAndModify", false);
app.use(Sanitizer());
app.use(
  require("express-session")({
    secret: " secret key",
    resave: false,
    saveUninitialized: false,
  })
);
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);

//login
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new local(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

//middleware login check

//logic

app.get("/login", (req, res) => {
  if(req.isAuthenticated()){
    res.redirect("/dashboard");
  }else{
    res.render("login", {error: req.flash("error")});
  }
});
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/dashboard",
    failureFlash: { type: 'error', message: "Mot de passe/Nom d'utilisateur invalide!" }
  }),
  (req, res) => {}
);

app.post("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});
//settings page
const storage = multer.diskStorage({
    destination: "./public/files/avatar/",
    filename: (req, file, cb) => {
      cb(null, req.user._id + "");
    },
  }),
  upload_img = multer({ storage: storage });
app.get("/dashboard/settings", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector, (req, res) => {
  res.render("settings.ejs");
});
app.post("/dashboard/settings", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector, upload_img.single("new_image"), (req, res) => {
  const obj = {};
  if (req.file) obj.photo_profile = req.user._id; //+'.'+//req.file.originalname.split('.').pop();
  obj.username = req.body.username;
  console.log("post=>"+req.user);
  user.findByIdAndUpdate(req.user._id, obj, (err, user) => {
    if (err) console.log(err);
    if (req.body.password)
    user.setPassword(req.body.password, (err)=>{
      user.save();
    });
    res.redirect("/dashboard");
  });
});
//choice page
app.get("/", (req, res) => {
  if(req.isAuthenticated()){
    res.redirect("/dashboard");
  }else{
    kipina.find({}, (err, kipina)=>{
      res.render("choices", {kipina: kipina});
    });
  }
  
});
//dashboard page
app.post("/dashboard/creation-pere", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  
});
app.post("/dashboard/creation-mere", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  const mere_obj = {
    nom: req.body.m_nom,
    prenom: req.body.m_prenom,
    courriel: req.body.m_courreil,
    nationalite: req.body.m_nationalite,
    profession: req.body.m_profession,
    telephone: req.body.m_tel,
    num_rue: req.body.m_n_rue,
    rue: req.body.m_rue,
    quartier: req.body.m_quartier,
    ville: req.body.m_ville,
    pays: req.body.m_pays,
    cin_passport: req.body.m_id,
    sexe: 0
  };
  personne.create(mere_obj, (err, mere) => {
    res.redirect("/dashboard/modification");
  });
});

app.post("/dashboard/", AccessMiddleware.isLoggedIn, (req, res) => {
  let bool = true,obj = {},
    paye = 0,
    cantine_1 = 0,
    cantine_2 = 0,
    impaye = 0,
    nbr_classe = 0,
    allergies = 0,
    transport = 0,
    gardes = 0,
    mercredi = 0,
    enfant_arr = [],
    personnel = 0,
    classe_arr = [0,0,0,0,0,0],
    gardes_1 = 0;
  kipina.find({ nom: req.user.location }, (err, kipina) => {
    nbr_classe = kipina[0].nbr_classe;
  });
  enfant.find({}, (err, total) => {
    total.forEach((iteration) => {
      console.log(req.body.class_check);
      if((req.body.class_check)){
      if(!Array.isArray(req.body.class_check)){
        if(req.body.class_check == ''+iteration.classe){
          bool &= true;
        }else{
          bool &= false;
        }
      }
      if(Array.isArray(req.body.class_check)){
      for (let i = 0; i < req.body.class_check.length; i++)
      req.body.class_check[i] = Number.parseInt(req.body.class_check[i]);
      if(req.body.class_check.includes(iteration.classe)){
        bool &= true;
      }else{
        bool &= false;
      }
    }
        if(req.body.paye == '1'){
          if(iteration.payement){
            bool &= true;}
          else{
            bool &= false;
          }
          }
        if(req.body.paye == '2'){
          if(!iteration.payement){
            bool &= true;
          }
          else{
            bool &= false;
          }
          }
        if(req.body.transport== '1'){
          if(iteration.transport){
            bool &= true;
          }
          else
            bool &= false;
        }
        if(req.body.transport= '2'){
          if(!iteration.transport){
            bool &= true;
          }
          else{
            bool &= false;
          }
        }
        if(req.body.garde == '1'){
          if(iteration.gardes && iteration.gardes_type.includes(1)){
            bool &=true;
          }
          else
            bool &= false;
        }
        if(req.body.garde == '2'){
          if(!iteration.gardes && iteration.gardes_type.includes(2)){
            bool &= true;
          }
          else
            bool &= false;
        }
        if(req.body.mercredi == '1'){
          if(iteration.mercredi){
            bool &= true;
          }
          else
            bool &= false;
        }
        if(req.body.mercredi == '2'){
          if(!iteration.mercredi){
            bool &= true;
          }
          else
            bool &= false;          
        }
        if(req.body.gouter == '2'){
          if(!iteration.gouter){
            bool &= true;
          }
          else
            bool &= false;          
        }
        if(req.body.gouter == '1'){
          if(iteration.gouter){
            bool &= true;
          }
          else
            bool &= false;          
        }
        if(req.body.cantine == '1'){
          if(iteration.gouter && iteration.type_cantine == 1){
            bool &= true;
          }
          else
            bool &= false;          
        }
        if(req.body.cantine == '2'){
          if(iteration.gouter && iteration.type_cantine == 2){
            bool &= true;
          }
          else
            bool &= false;          
        }
      }else{
        if(req.body.paye == '1'){
          if(iteration.payement){
            bool &= true;}
          else{
            bool &= false;
          }
          }
        if(req.body.paye == '2'){
          if(!iteration.payement){
            bool &= true;
          }
          else{
            bool &= false;
          }
          }
        if(req.body.transport== '1'){
          if(iteration.transport){
            bool &= true;
          }
          else
            bool &= false;
        }
        if(req.body.transport= '2'){
          if(!iteration.transport){
            bool &= true;
          }
          else{
            bool &= false;
          }
        }
        if(req.body.garde == '1'){
          if(iteration.gardes && iteration.gardes_type.includes(1)){
            bool &=true;
          }
          else
            bool &= false;
        }
        if(req.body.garde == '2'){
          if(!iteration.gardes && iteration.gardes_type.includes(2)){
            bool &= true;
          }
          else
            bool &= false;
        }
        if(req.body.mercredi == '1'){
          if(iteration.mercredi){
            bool &= true;
          }
          else
            bool &= false;
        }
        if(req.body.mercredi == '2'){
          if(!iteration.mercredi){
            bool &= true;
          }
          else
            bool &= false;          
        }
        if(req.body.gouter == '2'){
          if(!iteration.gouter){
            bool &= true;
          }
          else
            bool &= false;          
        }
        if(req.body.gouter == '1'){
          if(iteration.gouter){
            bool &= true;
          }
          else
            bool &= false;          
        }
        if(req.body.cantine == '1'){
          if(iteration.gouter && iteration.type_cantine == 1){
            bool &= true;
          }
          else
            bool &= false;          
        }
        if(req.body.cantine == '2'){
          if(iteration.gouter && iteration.type_cantine == 2){
            bool &= true;
          }
          else
            bool &= false;          
        }
      }
      if(bool)
        classe_arr[iteration.classe]++;
      console.log(bool);
      if (iteration.payement == true) paye++;
      if (iteration.payement == false) impaye++;
      medical.find({ eleve: iteration._id }, (err, medical) => {
        if (medical.allergie_desc != "") allergies++;
      });
      if(iteration.type_eleve == 1) personnel++;
      if (iteration.transport) transport++;
      if (iteration.gardes) gardes++;
      if (iteration.mercredi) mercredi++;
      if (iteration.type_cantine == 1) cantine_1++;
      if (iteration.type_cantine == 2) cantine_2++;
    });
    // console.log(enfant_arr);
    res.render("dashboard", {
      personnel: personnel,
      cantine_1: cantine_1,
      cantine_2: cantine_2,
      nbr_classe: nbr_classe,
      nbr_eleve: total.length,
      classe: classe_arr,
      paye: paye,
      impaye: impaye,
      allergies: allergies,
      transport: transport,
      mercredi: mercredi,
      gardes_1: gardes_1,
    });
  });
});
app.get("/dashboard/", AccessMiddleware.isLoggedIn, (req, res) => {
  console.log(req.user);
  let paye = 0,
    impaye = 0,
    nbr_classe = 0,
    allergies = 0,
    transport = 0,
    mercredi = 0,
    personnel = 0,
    cantine_1 = 0,
    cantine_2 = 0,
    classe_arr = [0,0,0,0,0,0],
    gardes_1 = 0;
  kipina.findOne({ nom: req.user.location }, (err, kipina) => {
    console.log(kipina);
    nbr_classe = kipina.nbr_classe;
    console.log(nbr_classe);
  });
  enfant.find({location: req.user.location, store:false}, (err, total) => {
    total.forEach((iteration) => {
      classe_arr[iteration.classe-1]++;
      if (iteration.payement) paye++;
      if (!iteration.payement) impaye++;
      medical.find({ eleve: iteration._id }, (err, medical) => {
        if (medical.allergie_desc != "") allergies++;
      });
      if (iteration.transport) transport++;
      if (iteration.mercredi) mercredi++;
      if (iteration.type_eleve == 1) personnel++;
      if (iteration.type_cantine == 1)cantine_1++;
      if (iteration.type_cantine == 2)cantine_2++;
      if (iteration.gardes)gardes_1++;
    });
    console.log(classe_arr);
    res.render("dashboard", {
      cantine_1: cantine_1,
      cantine_2: cantine_2,
      personnel: personnel,
      nbr_classe: nbr_classe,
      nbr_eleve: total.length,
      classe: classe_arr,
      paye: paye,
      impaye: impaye,
      allergies: allergies,
      transport: transport,
      mercredi: mercredi,
      gardes_1: gardes_1,
    });
  });
});

//creation of 'enfant' and all his fields

app.post("/create", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, upload.single("photo_enfant"), async(req, res) => {
  console.log("====>");
  console.log(req.body.key_p);
  console.log(req.body.key_m);
  console.log(req.body.pere);
  console.log(req.body.mere);
  let mere_, pere_, parlees = [];
  if(!Array.isArray(req.body.e_parlees)){
    parlees.push(req.body.e_parlees);
  }else{
    parlees = req.body.e_parlees; 
  }
  let enfant_obj = {
    nom: (req.body.e_nom).charAt(0).toUpperCase() + req.body.e_nom.slice(1),
    prenom: (req.body.e_prenom).charAt(0).toUpperCase() + req.body.e_prenom.slice(1),
    date_naissance: req.body.e_date,
    lieu_naissance: req.body.e_lieu,
    nationnalite: req.body.e_nationnalite,
    langue_maternelle: req.body.e_maternelle,
    langues_parlees: parlees,
    location: req.user.location,
  };
  if(req.body.key_p == "true"){
    console.log("ajouter pere");
    const pere_obj = {
      nom: req.body.p_nom,
      prenom: req.body.p_prenom,
      courriel: req.body.p_courreil,
      nationalite: req.body.p_nationalite,
      profession: req.body.p_profession,
      telephone: req.body.p_tele,
      num_rue: req.body.p_n_rue,
      rue: req.body.p_rue,
      quartier: req.body.p_quartier,
      ville: req.body.p_ville,
      pays: req.body.p_pays,
      cin_passport: req.body.p_id,
      sexe: 1
    };
      await personne.create(pere_obj).then(pere => {
        console.log(pere);
        enfant_obj.pere = pere._id;
        console.log("pere1:"+enfant_obj.pere);
      });
    console.log("pere:"+enfant_obj.pere);
  }if(req.body.key_p == "false"){
    enfant_obj.pere = req.body.pere;
    console.log("pere2:"+enfant_obj.pere);
  }
  if(req.body.key_m == "true"){
    console.log("ajouter mere");
    const mere_obj = {
      nom: req.body.m_nom,
      prenom: req.body.m_prenom,
      courriel: req.body.m_courreil,
      nationalite: req.body.m_nationalite,
      profession: req.body.m_profession,
      telephone: req.body.m_tel,
      num_rue: req.body.m_n_rue,
      rue: req.body.m_rue,
      quartier: req.body.m_quartier,
      ville: req.body.m_ville,
      pays: req.body.m_pays,
      cin_passport: req.body.m_id,
      sexe: 0
    };
      await personne.create(mere_obj).then(mere => {
        enfant_obj.mere = mere._id;
        console.log("mere1:"+enfant_obj.mere);
      });
    console.log("mere:"+enfant_obj.mere);
  }if(req.body.key_m == "false"){
    console.log("mere2:"+enfant_obj.mere);
    enfant_obj.mere = req.body.mere;
  }
  console.log(enfant_obj.pere+" pere:mere "+enfant_obj.mere);
  if(req.body.sm == 'oui')
    enfant_obj.sm = true;
  if(req.body.sm == 'non')
    enfant.sm = false;
  if (req.file) {
    enfant_obj.image = req.file.filename;
  }
  if (req.body.forfait) {
    enfant_obj.forfait = true;
    enfant_obj.type_forfait = req.body.forfait;
  }
  if (!req.body.forfait) {
    enfant_obj.forfait = false;
  }
  if (req.body.service == '1') {
    enfant_obj.gardes = true;
    enfant_obj.gardes_type = 1;
  }
  if (req.body.service == '2') {
    enfant_obj.gardes = true;
    enfant_obj.gardes_type = 1;
  }
  if (!req.body.service) {
    enfant_obj.gardes = false;
  }
  if (req.body.transport == '1') {
    enfant_obj.transport = true;
    enfant_obj.type_transport = 1;
  }
  if (req.body.transport == '2') {
    enfant_obj.transport = true;
    enfant_obj.type_transport = 2;
  }
  if (req.body.transport == '3') {
    enfant_obj.transport = true;
    enfant_obj.type_transport = 3;
  }
  if (!req.body.transport) {
    enfant_obj.transport = false;
  }
  if (req.body.mercredi == "1") {
    enfant_obj.mercredi = true;
  }
  if (req.body.mercredi == "2") {
    enfant_obj.mercredi = false;
  }
  if (req.body.cantine) {
    enfant_obj.cantine = true;
    if (req.body.cantine == "1") enfant_obj.type_cantine = 1;
    if (req.body.cantine == "2") enfant_obj.type_cantine = 2;
  }
  if (!req.body.cantine) {
    enfant_obj.cantine = false;
  }
  if(req.body.gouter == '1'){
    enfant_obj.gouter = true;
  }
  if(req.body.gouter == '2'){
    enfant_obj.gouter = false;
  }
  if (req.body.classe) enfant_obj.classe = Number.parseInt(req.body.classe);
  if (req.body.enfant == "1") enfant_obj.sexe = 1;
  if (req.body.enfant == "2") enfant_obj.sexe = 0;
  enfant_obj.type_eleve = Number.parseInt(req.body.type_eleve);
  console.log(enfant_obj);
  await enfant.create(enfant_obj, (err, enfant_) => {
    console.log("id enfant:", enfant_);
    routine.create({eleve:enfant_._id}, (err, routine)=>{});
    let historique_obj = {nom: enfant_.nom, prenom: enfant_.prenom, date_inscription: Date.now()};
    historique.create(historique_obj, (err, historique)=>{
      if(historique)
        console.log("created");
      else
        console.log("not created");
    });
    if(err)
      console.log(err);
    else {
      console.log("enfant created!");
      const urgence_obj = {
        nom: req.body.nom_urgence,
        lien: req.body.lien_urgence,
        telephone: req.body.tel_urgence,
        eleve: enfant_,
      };
      const medical_obj = {
        nom: req.body.medcin_nom,
        adresse_medcine: req.body.adresse_medcine,
        // adresse_clinique: req.body.adresse_clinique,
        telephone: req.body.medcin_tel,
        accident_desc: req.body.accident,
        allergie_desc: req.body.allergies,
        medica_desc: req.body.medicaments,
        info_plus: req.body.info,
        eleve: enfant_,
      };
      console.log(medical_obj);
      if (req.body.prob_oui === "on") {
        medical_obj.prob_sante = true;
        medical_obj.type_prob = req.body.desc_prob_sante;
      }
      if (req.body.prob_non === "on") medical.obj.prob_sante = false;
      const medical_arr = [];
      if (req.body.s11 === "on") medical_arr.push(1);
      if (req.body.s12 === "on") medical_arr.push(2);
      if (req.body.s13 === "on") medical_arr.push(3);
      if (req.body.s14 === "on") medical_arr.push(4);
      if (req.body.s15 === "on") medical_arr.push(5);
      if (req.body.s16 === "on") medical_arr.push(6);
      if (req.body.s17 === "on") medical_arr.push(7);
      if (req.body.s18 === "on") medical_arr.push(8);
      if (req.body.s19 === "on") medical_arr.push(9);
      if (req.body.s110 === "on") medical_arr.push(10);
      // other column
      if (req.body.s21 === "on") medical_arr.push(11);
      if (req.body.s22 === "on") medical_arr.push(12);
      if (req.body.s23 === "on") medical_arr.push(13);
      if (req.body.s24 === "on") medical_arr.push(14);
      if (req.body.s25 === "on") medical_arr.push(15);
      if (req.body.s26 === "on") medical_arr.push(16);
      if (req.body.s27 === "on") medical_arr.push(17);
      if (req.body.s28 === "on") medical_arr.push(18);
      if (req.body.s29 === "on") medical_arr.push(19);
      if (req.body.s210 === "on") medical_arr.push(20);
      medical_obj.type_maladie = medical_arr;
      if (medical_arr.length > 0)
        medical_obj.maladie_desc = req.body.maladie_detaille;
      console.log("=>medica:"+req.body.oui+"/"+req.body.horaires);
      if ((req.body.oui === "on")) {
        medical_obj.medica = true;
        medical_obj.medica_horaires = req.body.horaires;
      }
      if ((req.body.non === "on")) medical_obj.medica = false;
      urgence.create(urgence_obj, (err, urgence) => {
        if (err) console.log(err);
        else {
          console.log("urgence created!");
        }
      });
      medical.create(medical_obj, (err, medical) => {
        if (err) console.log(err);
        else console.log("medical created!");
      });
      res.redirect("/dashboard/modification");
    }
  });
});
app.post("/dashboard/delete/:id", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector,async (req, res) => {
  let ObjectId = require('mongoose').Types.ObjectId; 
  await enfant.findById(req.params.id, (err, enfant_)=>{
    console.log("=>"+enfant_);
    enfant.countDocuments({pere:enfant_.pere}, (err, count)=>{
      console.log(count);
      if(count <= 1)
        personne.findByIdAndRemove(enfant_.pere, (err, pere)=>{
          console.log("deleted pere!");
          console.log(pere);
        });
    });
    enfant.countDocuments({mere:enfant_.mere}, (err, count)=>{
      console.log(count);
      if(count <= 1)
        personne.findByIdAndRemove(enfant_.mere, (err, mere)=>{
          console.log("deleted mere!");
          console.log(mere);
        });
    });
    });
  enfant.findByIdAndDelete(req.params.id, (err, enfant_) => {
    let tmp = [];
    urgence.findOneAndDelete({ eleve: enfant_._id }, (err, urgence) => {});
    medical.findOneAndDelete({ eleve: enfant_._id }, (err, medical) => {});
    routine.findOneAndRemove({eleve: req.params.id}, (err, routine)=>{});
    camp_eleve.find({}, (err, _camp_eleve)=>{
      if(err || !_camp_eleve)
        res.redirect("/dashboard/modification");
      else
          _camp_eleve.forEach((item)=>{
          let index = item.eleve.indexOf(req.params.id), tmp = item.eleve;
          if(index != -1){
            tmp.splice(index, 1);
            let obj = {eleve: tmp};
            camp_eleve.findByIdAndUpdate(item._id, obj, (err, camp_eleve)=>{});
          }
        });
    });
    english.findOne({location: req.user.location}, (err, eas)=>{
      let tmp = [], index;
      console.log("eas=>"+eas);
      if(err || !eas)
        res.redirect("/dashboard/modification");
      else{
         try{
          index = eas.eleve.indexOf(req.params.id);
          if(index != -1){
            tmp = eas.eleve;
            tmp.splice(index, 1);
            let obj = {eleve: tmp};
            english.findByIdAndUpdate(eas._id, obj, (err, eas2)=>{
              res.redirect("/dashboard/modification");
            });
          }else{
            res.redirect("/dashboard/modification")
          }
         }catch(err){
           res.redirect("/dashboard/modification");
         }
        }
    });
  });
});

app.get("/dashboard/modification", AccessMiddleware.isLoggedIn, [AccessMiddleware.isSuper], (req, res) => {
  let arr_pere = [],
    arr_mere = [],
    nbr_classe = 0, classe_arr = [0,0,0,0,0,0];
  personne.find({}, (err, personne) => {
    personne.forEach((personne) => {
      if (personne.sexe == 0) arr_mere.push(personne);
      if (personne.sexe == 1) arr_pere.push(personne);
    });
    enfant.find({location: req.user.location, store: false}, (err, enfant) => {
      enfant.forEach((item)=>{
        classe_arr[item.classe-1]++;
      });
      kipina.find({ nom: req.user.location }, (err, kipina) => {
        console.log(enfant);
        res.render("modification", {
          pere: arr_pere,
          mere: arr_mere,
          classe: classe_arr,
          nbr_classe: kipina[0].nbr_classe,
        });
      });
    });
  });
});
app.post("/dashboard/modification", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  let bool = true, arr_pere = [],
    arr_mere = [], classe_arr = [0,0,0,0,0,0];
  personne.find({}, (err, personne) => {
    personne.forEach((personne) => {
      if (personne.sexe == 0) arr_mere.push(personne);
      if (personne.sexe == 1) arr_pere.push(personne);
    });
    let enfant_arr = [];
    if (req.body.class_check)
    enfant.find({}, (err, enfant) => {
      enfant.forEach((iteration) => {
        if((req.body.class_check)){
          console.log("class check");
        if(!Array.isArray(req.body.class_check)){
          if(req.body.class_check == ''+iteration.classe){
            console.log("contain");
            bool &= true;
          }else{
            console.log("not in");
            bool &= false;
          }
        }
        if(Array.isArray(req.body.class_check)){
        for (let i = 0; i < req.body.class_check.length; i++)
        req.body.class_check[i] = Number.parseInt(req.body.class_check[i]);
        if(req.body.class_check.includes(iteration.classe)){
          console.log("in array");
          bool &= true;
        }else{
          console.log("not in the array");
          bool &= false;
        }
      }
      if(req.body.paye == '1'){
        if(iteration.payement){
          bool &= true;}
        else{
          bool &= false;
        }
        }
      if(req.body.paye == '2'){
        if(!iteration.payement){
          bool &= true;
        }
        else{
          bool &= false;
        }
        }
      if(req.body.transport== '1'){
        if(iteration.transport){
          bool &= true;
        }
        else
          bool &= false;
      }
      if(req.body.transport= '2'){
        if(!iteration.transport){
          bool &= true;
        }
        else{
          bool &= false;
        }
      }
      if(req.body.garde == '1'){
        if(iteration.gardes && iteration.gardes_type.includes(1)){
          bool &=true;
        }
        else
          bool &= false;
      }
      if(req.body.garde == '2'){
        if(!iteration.gardes && iteration.gardes_type.includes(2)){
          bool &= true;
        }
        else
          bool &= false;
      }
      if(req.body.mercredi == '1'){
        if(iteration.mercredi){
          bool &= true;
        }
        else
          bool &= false;
      }
      if(req.body.mercredi == '2'){
        if(!iteration.mercredi){
          bool &= true;
        }
        else
          bool &= false;          
      }
      if(req.body.gouter == '2'){
        if(!iteration.gouter){
          bool &= true;
        }
        else
          bool &= false;          
      }
      if(req.body.gouter == '1'){
        if(iteration.gouter){
          bool &= true;
        }
        else
          bool &= false;          
      }
      if(req.body.cantine == '1'){
        if(iteration.gouter && iteration.type_cantine == 1){
          bool &= true;
        }
        else
          bool &= false;          
      }
      if(req.body.cantine == '2'){
        if(iteration.gouter && iteration.type_cantine == 2){
          bool &= true;
        }
        else
          bool &= false;          
      }
        }else{
          if(req.body.paye == '1'){
            if(iteration.payement){
              bool &= true;}
            else{
              bool &= false;
            }
            }
          if(req.body.paye == '2'){
            if(!iteration.payement){
              bool &= true;
            }
            else{
              bool &= false;
            }
            }
          if(req.body.transport== '1'){
            if(iteration.transport){
              bool &= true;
            }
            else
              bool &= false;
          }
          if(req.body.transport= '2'){
            if(!iteration.transport){
              bool &= true;
            }
            else{
              bool &= false;
            }
          }
          if(req.body.garde == '1'){
            if(iteration.gardes && iteration.gardes_type.includes(1)){
              bool &=true;
            }
            else
              bool &= false;
          }
          if(req.body.garde == '2'){
            if(!iteration.gardes && iteration.gardes_type.includes(2)){
              bool &= true;
            }
            else
              bool &= false;
          }
          if(req.body.mercredi == '1'){
            if(iteration.mercredi){
              bool &= true;
            }
            else
              bool &= false;
          }
          if(req.body.mercredi == '2'){
            if(!iteration.mercredi){
              bool &= true;
            }
            else
              bool &= false;          
          }
          if(req.body.gouter == '2'){
            if(!iteration.gouter){
              bool &= true;
            }
            else
              bool &= false;          
          }
          if(req.body.gouter == '1'){
            if(iteration.gouter){
              bool &= true;
            }
            else
              bool &= false;          
          }
          if(req.body.cantine == '1'){
            if(iteration.gouter && iteration.type_cantine == 1){
              bool &= true;
            }
            else
              bool &= false;          
          }
          if(req.body.cantine == '2'){
            if(iteration.gouter && iteration.type_cantine == 2){
              bool &= true;
            }
            else
              bool &= false;          
          }
        }
        if(bool)
          classe_arr[iteration.classe]++;
      });
      kipina.find({ nom: req.user.location }, (err, kipina) => {
        res.render("modification", {
          pere: arr_pere,
          mere: arr_mere,
          classe: classe_arr,
          nbr_classe: kipina[0].nbr_classe,
        });
      });
    });
  });
});
app.get("/dashboard/modification/:id", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  let arr_mere = [],
      arr_pere = [];
  personne.find({}, (err, personne) => {
    personne.forEach((personne) => {
      if (personne.sexe == 0) arr_mere.push(personne);
      if (personne.sexe == 1) arr_pere.push(personne);
    });
  enfant.findById(req.params.id, (err, enfant) => {
    urgence.findOne({eleve: enfant._id},(err, urgence)=>{
         medical.findOne({eleve: enfant._id}, (err, medical)=>{
            kipina.findOne({nom: req.user.location}, (err, kipina)=>{
              res.render("edit", { enfant: enfant, urgence: urgence, medical:medical, nbr_classe: kipina.nbr_classe, pere: arr_pere, mere: arr_mere});
            });
           });
         });
    });
  });
});
app.post(
  "/dashboard/modification/:id",
  AccessMiddleware.isLoggedIn,AccessMiddleware.isSuper,
  upload.single("photo_enfant"),
  (req, res) => {
    let parlees = [];
    if(!Array.isArray(req.body.e_parlees)){
      parlees.push(req.body.e_parlees);
    }else{
      parlees = req.body.e_parlees; 
    }
    const enfant_obj = {
      nom: (req.body.e_nom).charAt(0).toUpperCase() + req.body.e_nom.slice(1),
      prenom: (req.body.e_prenom).charAt(0).toUpperCase() + req.body.e_prenom.slice(1),
      date_naissance: req.body.e_date,
      lieu_naissance: req.body.e_lieu,
      nationnalite: req.body.e_nationnalite,
      langue_maternelle: req.body.e_maternelle,
      langues_parlees: parlees,
      pere: req.body.pere_radio,
      mere: req.body.mere_radio
    };
    if(req.body.ancien == "oui")
      enfant_obj.type_scolarite = 1;
    if(req.body.ancien == "non")
      enfant_obj.type_scolarite = 2;
    if(req.body.sm == 'oui')
      enfant_obj.sm = true;
    if(req.body.sm == 'non')
      enfant_obj.sm = false;
    if (req.file) {
      enfant_obj.image = req.file.filename;
    }
    if (req.body.forfait) {
      enfant_obj.forfait = true;
      enfant_obj.type_forfait = req.body.forfait;
    }
    if (!req.body.forfait) {
      enfant_obj.forfait = false;
    }
    if (req.body.service == '1') {
      enfant_obj.gardes = true;
      enfant_obj.gardes_type = 1;
    }
    if (req.body.service == '2') {
      enfant_obj.gardes = true;
      enfant_obj.gardes_type = 1;
    }
    if (!req.body.service) {
      enfant_obj.gardes = false;
    }
    if (req.body.transport == '1') {
      enfant_obj.transport = true;
      enfant_obj.type_transport = 1;
    }
    if (req.body.transport == '2') {
      enfant_obj.transport = true;
      enfant_obj.type_transport = 2;
    }
    if (req.body.transport == '3') {
      enfant_obj.transport = true;
      enfant_obj.type_transport = 3;
    }
    if (!req.body.transport) {
      enfant_obj.transport = false;
    }
    if (req.body.mercredi == "1") {
      enfant_obj.mercredi = true;
    }
    if (req.body.mercredi == "2") {
      enfant_obj.mercredi = false;
    }
    if (req.body.cantine) {
      enfant_obj.cantine = true;
      if (req.body.cantine == "1") enfant_obj.type_cantine = 1;
      if (req.body.cantine == "2") enfant_obj.type_cantine = 2;
    }
    if (!req.body.cantine) {
      enfant_obj.cantine = false;
    }
    if(req.body.gouter == '1'){
      enfant_obj.gouter = true;
    }
    if(req.body.gouter == '2'){
      enfant_obj.gouter = false;
    }
    if (req.body.classe) enfant_obj.classe = Number.parseInt(req.body.classe);
    if (req.body.e_garcon === "on") enfant_obj.sexe = 1;
    if (req.body.e_fille === "on") enfant_obj.sexe = 0;
    enfant_obj.type_eleve = Number.parseInt(req.body.type_eleve);
    console.log(enfant_obj);
    enfant.findByIdAndUpdate(req.params.id, enfant_obj, (err, enfant) => {
      console.log("upadted=>"+enfant);
    const urgence_obj = {
      nom: req.body.nom_urgence,
      lien: req.body.lien_urgence,
      telephone: req.body.tel_urgence,
    };
    const medical_obj = {
      nom: req.body.medcin_nom,
      adresse_medcine: req.body.adresse_medcine,
      // adresse_clinique: req.body.adresse_clinique,
      telephone: req.body.medcin_tel,
      accident_desc: req.body.accident,
      allergie_desc: req.body.allergies,
      medica_desc: req.body.medicaments,
      info_plus: req.body.info,
    };
    if (req.body.prob_oui === "on") {
      medical_obj.prob_sante = true;
      medical_obj.type_prob = req.body.desc_prob_sante;
    }
    if (req.body.prob_non === "on") medical_obj.prob_sante = false;
    const medical_arr = [];
    if (req.body.s11 === "on") medical_arr.push(1);
    if (req.body.s12 === "on") medical_arr.push(2);
    if (req.body.s13 === "on") medical_arr.push(3);
    if (req.body.s14 === "on") medical_arr.push(4);
    if (req.body.s15 === "on") medical_arr.push(5);
    if (req.body.s16 === "on") medical_arr.push(6);
    if (req.body.s17 === "on") medical_arr.push(7);
    if (req.body.s18 === "on") medical_arr.push(8);
    if (req.body.s19 === "on") medical_arr.push(9);
    if (req.body.s110 === "on") medical_arr.push(10);
    // other column
    if (req.body.s21 === "on") medical_arr.push(11);
    if (req.body.s22 === "on") medical_arr.push(12);
    if (req.body.s23 === "on") medical_arr.push(13);
    if (req.body.s24 === "on") medical_arr.push(14);
    if (req.body.s25 === "on") medical_arr.push(15);
    if (req.body.s26 === "on") medical_arr.push(16);
    if (req.body.s27 === "on") medical_arr.push(17);
    if (req.body.s28 === "on") medical_arr.push(18);
    if (req.body.s29 === "on") medical_arr.push(19);
    if (req.body.s210 === "on") medical_arr.push(20);
    medical_obj.type_maladie = medical_arr;
    if (medical_arr.length > 0)
      medical_obj.maladie_desc = req.body.maladie_detaille;
    if (req.body.oui === "on") {
      medical_obj.medica = true;
      medical_obj.medica_horaires = req.body.horaires;
    }
    if ((req.body.non === "on")) medical_obj.medica = false;
    // console.log(medical_obj);
    // console.log(urgence);
    urgence.findOneAndUpdate({ eleve: enfant._id },urgence_obj, (err, urgence)=>{});
    medical.findOneAndUpdate({ eleve: enfant._id },medical_obj, (err, medical)=>{
      console.log(medical);
    });
    res.redirect("/dashboard/modification");
  });
});

//delete 'enfant' and advanced operations like searching if parents exist in another 'enfant' !!!

//server listener
//process.env.PORT
app.listen(process.env.PORT || 3000, () => {
  console.log("server started!");
});
// app.get("/register", (req, res) => {
//   res.render("register");
// });

//add kipina's

app.get("/dashboard/add-kipina", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector,(req, res) => {
  res.render("add-kipina");
});
app.post("/dashboard/add-kipina", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector, (req, res) => {
  english.create({}, (err, english)=>{});
  kipina.create(
    {
      nom: req.body.nom
    },
    (err, kipina) => {
      prix.create({location: req.body.nom}, (err, prix)=>{
        res.redirect("/dashboard/add-kipina");
      });
    }
  );
});

// add users

app.get("/dashboard/add-user", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector,(req, res) => {
  kipina.find({}, (err, kipina) => {
    res.render("add-user", { kipina: kipina });
  });
});
app.post("/dashboard/add-user", AccessMiddleware.isLoggedIn,  AccessMiddleware.isDirector,(req, res) => {
  let obj = {
    username: req.body.username,
    nom: (req.body.nom).charAt(0).toUpperCase() + req.body.nom.slice(1),
    prenom: req.body.prenom,
    role: req.body.role,
    location: req.body.location,
  };
  if(req.body.class){
    if(Array.isArray(req.body.class)){
      for(let i=0;i<req.body.class.length;i++){
        req.body.class[i] = Number.parseInt(req.body.class[i]);
      }
      obj.classe = req.body.class;
    }else{
      obj.classe = [req.body.class];
      }
    }
  user.register(
    new user(obj),
    req.body.password,
    (err, user) => {
      res.redirect("/dashboard");
    }
  );
});
//rapport cantine
app.get("/dashboard/rapport-cantine", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  kipina.findOne({nom:req.user.location}, (err, kipina)=>{
    console.log(kipina.nbr_classe);
    res.render("rapport-cantine", {nbr_classe: kipina.nbr_classe});
  });
});
app.post("/cantine-global", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  enfant.find({store: false, cantine: true, location: req.user.location}).sort({date_naissance:-1}).exec((err, result)=>{
    res.render("templates/cantine-global", {enfant: result});
  });
});
app.post("/rapport-cantine", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  if (req.body.class_check)
    for (let i = 0; i < req.body.class_check.length; i++)
      req.body.class_check[i] = Number.parseInt(req.body.class_check[i]);
      
  if (req.body.cantine)
    for (let i = 0; i < req.body.cantine.length; i++)
      req.body.cantine[i] = Number.parseInt(req.body.cantine[i]);
  let enfant_arr = [],
    type1 = 0,
    type2 = 0;
    console.log("=>"+req.body.class_check);
    console.log("=>"+req.body.cantine);
  enfant.find({location: req.user.location, store: false}).sort({date_naissance: -1}).exec((err, allEnfant)=>{
    allEnfant.forEach((enfant) => {
      console.log(enfant);
      if (req.body.class_check && req.body.cantine)
        if (req.body.class_check.includes(enfant.classe) && req.body.cantine.includes(enfant.type_cantine) ){
          console.log("ok");
          enfant_arr.push(enfant);
          if (enfant.type_cantine == 1) type1++;
      if (enfant.type_cantine == 2) type2++;
        }
    });
    console.log(type1);
    console.log(type2);
    console.log(enfant_arr);
  res.render("templates/cantine", {enfant: enfant_arr, type1:type1, type2:type2, classes: req.body.class_check});
  // , (err, data)=>{
  //     pdf.create(data, {"format":"A4",
  //     "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./rapport-cantine.pdf", (err, file)=>{
  //       res.download("rapport-cantine.pdf", (err)=>{
  //         console.log(err);
  //       });
  //     });
  // });
});
});
//rapport assurance
app.get("/dashboard/rapport-assurance", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  kipina.findOne({nom:req.user.location}, (err, kipina)=>{
    res.render("rapport-assurance", {nbr_classe: kipina.nbr_classe});
  });
});

app.post("/assurance-global", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  enfant.find({store: false, location: req.user.location}).sort({date_naissance:-1}).exec((err, result)=>{
    res.render("templates/assurance-global", {enfant: result});
  });
});
app.post("/rapport-assurance", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  if (req.body.class_check)
    for (let i = 0; i < req.body.class_check.length; i++)
      req.body.class_check[i] = Number.parseInt(req.body.class_check[i]);
  let enfant_arr = [];
  enfant.find({location: req.user.location, store: false}).sort({date_naissance: -1}).exec((err, allEnfant) => {
    allEnfant.forEach((enfant) => {
      if (req.body.class_check)
        if (req.body.class_check.includes(enfant.classe))
          enfant_arr.push(enfant);
    });
    res.render("templates/assurance", {enfant: enfant_arr, classes: req.body.class_check});
  //   , (err, data)=>{
  //     if(err)
  //       console.log(err);
  //     console.log("==>"+data);
  //     pdf.create(data, {"format":"A4",
  //     "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./rapport-assurance.pdf", (err, file)=>{
  //       res.download("rapport-assurance.pdf", (err)=>{
  //       });
  //     });
  // });
  });
});

//rapport par classe
app.get("/dashboard/rapport-classe", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  kipina.findOne({nom: req.user.location}, (err, kipina)=>{
    res.render("rapport-classe", {nbr_classe: kipina.nbr_classe});
  });
});


app.post("/classe-global", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let urgence_arr = [];
  enfant.find({store: false, location: req.user.location}).sort({date_naissance:-1}).exec(async (err, result)=>{
    await Promise.all(result.map(async (enfant)=>{
      await urgence.findOne({eleve: enfant._id}, async (err, urgence)=>{
        urgence_arr.push(urgence.telephone);
      });
    }));
    res.render("templates/classe-global", {enfant: result, urgence: urgence});
  });
});
app.post("/rapport-classe", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  let enfant_arr = [], urgence_arr = [];
  enfant.find({location: req.user.location, store: false}).sort({date_naissance: -1}).exec(async (err, enfant) => {
    enfant_arr.push(enfant);
      await Promise.all(enfant.map(async (enfant)=>{
        await urgence.findOne({eleve: enfant._id}, async (err, urgence)=>{
          urgence_arr.push(urgence.telephone);
          console.log(urgence_arr);
        });
      }));
  res.render("templates/classe", {enfant: enfant_arr, classes: req.body.class_check, urgence: urgence_arr});
  // , (err, data)=>{
  //     pdf.create(data, {"format":"A4",
  //     "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./rapport-classe.pdf", (err, file)=>{
  //       res.download("rapport-classe.pdf", (err)=>{
  //       });
  //     });
  // })
  });
});

//rapport par routine
app.get("/dashboard/rapport-routine", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  kipina.findOne({nom: req.user.location}, (err, kipina)=>{
    res.render("rapport-routine", {nbr_classe: kipina.nbr_classe});
  });
});

app.post("/routine-global", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let rapport_arr = [];
  routine.find({}, async (err, rapport) => {
    await enfant.find({location: req.user.location, store: false}).sort({date_naissance:-1}).exec(async (err, allEnfant) => {
      await Promise.all(rapport.map((item) => {
        allEnfant.forEach((enfant) => {
          if((item.eleve).equals(enfant._id)) {
            rapport_arr.push(item);
          }
        });
      }));
      res.render("templates/routine-global", {enfant: allEnfant, routine: rapport_arr});
    });
  });
});
//need to be changed
app.post("/rapport-routine", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  if (req.body.class_check)
    for(let i = 0; i < req.body.class_check.length; i++)
      req.body.class_check[i] = Number.parseInt(req.body.class_check[i]);
  let enfant_arr = [],
    rapport_arr = [];
  routine.find({}, async (err, rapport) => {
    await enfant.find({location: req.user.location, store: false}).sort({date_naissance:-1}).exec(async (err, allEnfant) => {
      await Promise.all(rapport.map((item) => {
        allEnfant.forEach((enfant) => {
          if((item.eleve).equals(enfant._id)) {
            console.log(item);
            rapport_arr.push(item);
            enfant_arr.push(enfant);
          }else{
            console.log("not ok");
          }
        });
      }));
      // res.render("templates/routine", {enfant:enfant_arr, classes: req.body.class_check, routine: rapport_arr});
      res.render("templates/routine", {enfant:enfant_arr, classes: req.body.class_check, routine: rapport_arr});
      // , (err, data)=>{
      //   pdf.create(data, {"format":"A4",
      //   "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./rapport-routine.pdf", (err, file)=>{
      //     res.download("rapport-routine.pdf", (err)=>{
      //       console.log(err);
      //     });
      //   });
      // });
    });
    });
  });
//rapport paye
app.get("/dashboard/rapport-paye", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  kipina.findOne({nom: req.user.location}, (err, kipina)=>{
    res.render("rapport-paye", {nbr_classe: kipina.nbr_classe});
  });
});

app.post("/paye-global", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  enfant.find({location: req.user.location, store: false, payement: true}).sort({date_naissance: -1}).exec((err, allEnfant) => {
    res.render("templates/payement-global", {enfant: allEnfant});
  });
});
app.post("/rapport-paye", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  if (req.body.class_check)
    for (let i = 0; i < req.body.class_check.length; i++)
      req.body.class_check[i] = Number.parseInt(req.body.class_check[i]);
  let enfant_arr = [];
  enfant.find({location: req.user.location, store: false}).sort({date_naissance: -1}).exec((err, allEnfant) => {
    allEnfant.forEach((enfant) => {
      if (enfant.payement) enfant_arr.push(enfant);
    });
    res.render("templates/paye", {enfant:enfant_arr, classes: req.body.class_check});
    // , (err, data)=>{
    //   pdf.create(data, {"format":"A4",
    //   "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./rapport-paye.pdf", (err, file)=>{
    //     res.download("rapport-paye.pdf", (err)=>{
    //     });
    //   });
    // });
  });
});

//rapport impaye
app.get("/dashboard/rapport-impaye", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  kipina.findOne({nom: req.user.location}, (err, kipina)=>{
    res.render("rapport-impaye", {nbr_classe: kipina.nbr_classe});
  });
});

app.post("/impaye-global", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  enfant.find({location: req.user.location, store: false, payement: false}).sort({date_naissance: -1}).exec((err, allEnfant) => {
    res.render("templates/impaye-global", {enfant: allEnfant});
  });
});

app.post("/rapport-impaye", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  if (req.body.class_check)
    for (let i = 0; i < req.body.class_check.length; i++)
      req.body.class_check[i] = Number.parseInt(req.body.class_check[i]);
  let enfant_arr = [];
  enfant.find({location: req.user.location, store: false}).sort({date_naissance: -1}).exec((err, allEnfant) => {
    allEnfant.forEach((enfant) => {
      if (!enfant.payement) enfant_arr.push(enfant);
    });
    res.render("templates/impaye", {enfant:enfant_arr, classes: req.body.class_check});
    // , (err, data)=>{
    //   pdf.create(data, {"format":"A4",
    //   "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./rapport-impaye.pdf", (err, file)=>{
    //     res.download("rapport-impaye.pdf", (err)=>{
    //       console.log(err);
    //     });
    //   });
    // });
  });
});

//rapport allergies
app.get("/dashboard/rapport-allergies", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  kipina.findOne({nom: req.user.location}, (err, kipina)=>{
    res.render("rapport-allergies", {nbr_classe: kipina.nbr_classe});
  });
});

app.post("/allergies-global", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let allergie_arr = [];
  enfant.find({location: req.user.location, store: false}).sort({date_naissance:-1}).exec(async (err, allEnfant) => {
    await Promise.all(allEnfant.map(async (enfant) => {
      await medical.find({ eleve: enfant._id }, async (err, medical) => {
        if (medical[0].allergie_desc.length > 0) {
          allergie_arr.push(medical[0].allergie_desc);
        }
      });
    }));
    res.render("templates/allergies-global", {enfant: allEnfant, allergies:allergie_arr});
});
});
app.post("/rapport-allergies", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  if (req.body.class_check)
    for (let i = 0; i < req.body.class_check.length; i++)
      req.body.class_check[i] = Number.parseInt(req.body.class_check[i]);
  let enfant_arr = [],
    allergie_arr = [];
  enfant.find({location: req.user.location, store: false}).sort({date_naissance:-1}).exec(async (err, allEnfant) => {
    await Promise.all(allEnfant.map(async (enfant) => {
      await medical.find({ eleve: enfant._id }, async (err, medical) => {
        console.log(medical);
        if (medical[0].allergie_desc.length > 0) {
          allergie_arr.push(medical[0].allergie_desc);
        }
      });
    }));
    console.log(allergie_arr);
    res.render("templates/allergies", {enfant:enfant_arr, classes: req.body.class_check, allergies: allergie_arr});
    // , (err, data)=>{
    //   console.log(data);
    //   pdf.create(data, {"format":"A4",
    //   "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./rapport-allergies.pdf", (err, file)=>{
    //     res.download("rapport-allergies.pdf", (err)=>{
    //       console.log(err);
    //     });
    //   });
    // });
  });
});

//rapport gardes
app.get("/dashboard/rapport-gardes", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  kipina.findOne({nom: req.user.location}, (err, kipina)=>{
    res.render("rapport-gardes", {nbr_classe: kipina.nbr_classe});
  });
});

app.post("/gardes-global", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  enfant.find({location: req.user.location, store: false, gardes: true}).sort({date_naissance: -1}).exec((err, allEnfant) => {
    res.redirect("templates/gardes-global", {enfant: AllEnfant});
  });
});
app.post("/rapport-gardes", AccessMiddleware.isLoggedIn, (req, res) => {
  if (req.body.class_check)
    for (let i = 0; i < req.body.class_check.length; i++)
      req.body.class_check[i] = Number.parseInt(req.body.class_check[i]);
  let enfant_arr = [];
  enfant.find({location: req.user.location, store: false}).sort({date_naissance: -1}).exec((err, allEnfant) => {
    allEnfant.forEach((enfant) => {
      if (enfant.gardes) enfant_arr.push(enfant);
    });
    res.render("templates/gardes", {enfant:enfant_arr, classes: req.body.class_check});
    // , (err, data)=>{
    //   pdf.create(data, {"format":"A4",
    //   "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./rapport-gardes.pdf", (err, file)=>{
    //     res.download("rapport-gardes.pdf", (err)=>{
    //     });
    //   });
    // });
  });
});

//rapport mercredi apr??s midi
app.get("/dashboard/rapport-mercredi", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  kipina.findOne({nom: req.user.location}, (err, kipina)=>{
    res.render("rapport-mercredi", {nbr_classe: kipina.nbr_classe});
  });
});

app.post("/mercredi-global", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  enfant.find({location: req.user.location, store: false, mercredi: true}).sort({date_naissance: -1}).exec((err, allEnfant) => {
    res.render("templates/global-mercredi", {enfant: allEnfant});
  });
});

app.post("/rapport-mercredi", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  if (req.body.class_check)
    for (let i = 0; i < req.body.class_check.length; i++)
      req.body.class_check[i] = Number.parseInt(req.body.class_check[i]);
  let enfant_arr = [];
  enfant.find({location: req.user.location, store: false}).sort({date_naissance: -1}).exec((err, allEnfant) => {
    allEnfant.forEach((item) => {
      if(item.mercredi)
        enfant_arr.push(item);
    });
    res.render("templates/mercredi", {enfant:enfant_arr, classes: req.body.class_check});
    // , (err, data)=>{
    //   pdf.create(data, {"format":"A4",
    //   "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./rapport-mercredi.pdf", (err, file)=>{
    //     res.download("rapport-mercredi.pdf", (err)=>{
    //     });
    //   });
    // });
  });
});
//rapport emails parents

app.get("/dashboard/rapport-parent-email", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  kipina.findOne({nom: req.user.location}, (err, kipina)=>{
    res.render("rapport-parent-email", {nbr_classe: kipina.nbr_classe});
  });
});

app.post("/email-global", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let pere_arr = [], mere_arr = [], key = false;
  if(req.body.print){
    key = true;
  }
  enfant.find({location: req.user.location, store: false}).sort({date_naissance: -1}).exec(async (err, allEnfant) => {
    await Promise.all(allEnfant.map(async (enfant)=>{
      await personne.findOne({ sexe: 1, _id: enfant.pere }, (err, pere) => {
        pere_arr.push(pere);
      });
      await personne.findOne({ sexe: 0, _id: enfant.mere }, (err, mere) => {
        mere_arr.push(mere);
      });
    }));
    res.render("templates/emails-global", {enfant:allEnfant, pere: pere_arr, mere: mere_arr, key: key});
    });
});
app.post("/rapport-email", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  if (req.body.class_check)
    for (let i = 0; i < req.body.class_check.length; i++)
      req.body.class_check[i] = Number.parseInt(req.body.class_check[i]);
  let enfant_arr = [],
    pere_arr = [],
    mere_arr = [];
    
  enfant.find({location: req.user.location, store: false}).sort({date_naissance: -1}).exec(async (err, allEnfant) => {
    console.log(allEnfant);
    console.log("----------------------------------\n");
    await Promise.all(allEnfant.map(async (enfant)=>{
      enfant_arr.push(enfant);
      await personne.findOne({ sexe: 1, _id: enfant.pere }, (err, pere) => {
        pere_arr.push(pere);
      });
      await personne.findOne({ sexe: 0, _id: enfant.mere }, (err, mere) => {
        mere_arr.push(mere);
      });
    }));
    console.log(pere_arr);
    console.log(mere_arr);
    res.render("templates/emails", {enfant:enfant_arr, classes: req.body.class_check, pere: pere_arr, mere: mere_arr});
    // , (err ,data)=>{
    //   pdf.create(data, {"format":"A4",
    //   "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./rapport-email.pdf", (err, file)=>{
    //     res.download("rapport-email.pdf", (err)=>{
    //       console.log("downloaded!");
    //     });
    //   });
    // });
    });
  });
 
  
//rapport transport

app.get("/dashboard/rapport-transport", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  kipina.findOne({nom: req.user.location}, (err, kipina)=>{
    res.render("rapport-transport", {nbr_classe: kipina.nbr_classe});
  });
});

app.post("/transport-global", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  enfant.find({location: req.user.location, store: false, transport: true}).sort({date_naissance: -1}).exec((err, allEnfant) => {
    res.render("templates/transport-global", {enfant: allEnfant});
  });
});
app.post("/rapport-transport", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  if (req.body.class_check)
    for (let i = 0; i < req.body.class_check.length; i++)
      req.body.class_check[i] = Number.parseInt(req.body.class_check[i]);
  let enfant_arr = [];
  enfant.find({location: req.user.location, store: false}).sort({date_naissance: -1}).exec(async (err, allEnfant) => {
    await Promise.all(allEnfant.map(async (item) => {
      if(item.transport){
        console.log("ok");
        enfant_arr.push(item);}
    }));
    res.render("templates/transport", {enfant:enfant_arr, classes: req.body.class_check});
    // , (err, data)=>{
    //   pdf.create(data, {"format":"A4",
    //   "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./rapport-transport.pdf", (err, file)=>{
    //     res.download("rapport-transport.pdf", (err)=>{
    //       console.log("downloaded!");
    //     });
    //   });
    // });
  });
});

app.get("/dashboard/rapport", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  res.render("rapport");
});

let camp_promise = camp_eleve.find({camp: camp._id}, (err, camp_eleve)=>{
  if(camp_eleve){
  console.log(camp_eleve+"\n\n");
    camp_eleve.forEach((camp_eleve)=>{
      camp_eleve_arr.push(camp_eleve);
    if(camp_eleve.eleve.length == 0){
      console.log("eleve:"+0);
      display_arr.push(0);
    }else if(camp_eleve.eleve.length >= 1){
      for(let id of camp_eleve.eleve){
         enfant.findById(id).exec((err, enfant)=>{
          image_arr.push(enfant.image);
          console.log("image:"+image_arr);
        });
      }
    }
    });}
});

app.get("/dashboard/camps", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let arr = [], x;
  console.log("camps")
  camp.find({location: req.user.location}, (err, camps)=>{
    console.log(camps);
    camps.forEach((camp_)=>{
      x = new Date(camp_.date_creation);
      x.setDate(x.getDate() + camp_.nbr_jrs);
      console.log(-x.getTime()+ new Date().getTime());
      if(x.getTime()- new Date().getTime() > 0){
        arr.push(camp_);
        console.log(camp_.date_creation);
      }else{
        console.log("ok");
        if(!camp_.fini){
          let obj = {fini: true};
        camp.findByIdAndUpdate(camp_._id, obj, (err, camp_)=>{
          console.log(camp_);
          console.log("inside")
        });
        }
      }
      Promise.all(camp_promise).then(()=>{
        console.log(image_arr);
      }).catch(()=>{});
    }); 
    res.render("camps", {camps: arr, key: true, add:false});
  });
});
app.get("/dashboard/historique-camps", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  camp.find({fini: true}, (err, camp_)=>{
    console.log(camp_);
    res.render("camps", {camps: camp_, key: false});
  });
});
//add camps
app.get("/dashboard/add-camps", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  res.render("add-camps");
});
app.post("/add-camps", (req, res) => {
  let camp_obj = {
    nom: req.body.nom.charAt(0).toUpperCase()+ req.body.nom.slice(1),
    nbr_jrs: Number.parseInt(req.body.nbr_jrs),
    location: req.user.location,
    type_camp: Number.parseInt(req.body.type)
  };
  camp.create(camp_obj, (err, camp)=>{
    camp_eleve.create({camp: camp._id, eleve: []}, (err, camp)=>{
      res.redirect("/dashboard/camps");
    });
  });
});

//add enfant to camps

app.get("/dashboard/camps/:id1/:id2/add-enfant-camps-interne", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
  let enfant_arr = [];
  enfant.find({type_eleve: 2, store: false}, (err, allEnfant)=>{
      camp_eleve.find({camp: req.params.id2}, (err, camp_eleves)=>{
        console.log(camp_eleves[0]);
        if(!camp_eleves[0]){
          res.render("add-enfant-camps-interne", {enfant:allEnfant, camp:req.params.id2});
        }else{
        allEnfant.forEach((enfant)=>{
          console.log(enfant._id);
            if(!camp_eleves[0].eleve.includes(enfant._id)){
              enfant_arr.push(enfant);
            }
        });
        res.render("add-enfant-camps-interne", {enfant:enfant_arr, camp:req.params.id2});
      }
    });
    });
  });

  app.get("/dashboard/camps/:id/add-enfant-camps-externe", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res) => {
    let enfant_arr = [];
    enfant.find({type_eleve: 3, store: false}, (err, allEnfant)=>{
        camp_eleve.find({camp: req.params.id}, (err, camp_eleves)=>{
          console.log(camp_eleves[0]);
          if(!camp_eleves[0]){
            res.render("add-enfant-camps-externe", {enfant:allEnfant, camp:req.params.id});
          }else{
          allEnfant.forEach((enfant)=>{
            console.log(enfant._id);
              if(!camp_eleves[0].eleve.includes(enfant._id)){
                enfant_arr.push(enfant);
              }
          });
          res.render("add-enfant-camps-externe", {enfant:enfant_arr, camp:req.params.id});
        }
      });
      });
    });


app.post("/:id/add-enfant-camp", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  const camp_eleve_obj = {};
  if(!Array.isArray(req.body.class_check)){
    camp_eleve.findOne({camp: req.params.id}, (err, camp)=>{
      console.log(camp);
      let eleve_arr = camp.eleve;
      eleve_arr.push(req.body.class_check);
      camp_eleve.findOneAndUpdate({camp: req.params.id}, {eleve: eleve_arr}, (err, camp)=>{
        res.redirect("/dashboard/camps");
      });
    }) ;
  }else{
    camp_eleve.findOne({camp: req.params.id}, (err, camp)=>{
      let eleve_arr = camp.eleve;
      (req.body.class_check).forEach((id)=>{
        eleve_arr.push(id);
      });
      camp_eleve.findOneAndUpdate({camp: req.params.id}, {eleve: eleve_arr}, (err, camp)=>{
        res.redirect("/dashboard/camps");
      });
    }) ;
  }
});

//preview camp

app.get("/dashboard/camps/:id", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let arr = [], x;
  console.log("camps")
  sous_camp.find({camp: req.params.id}, (err, camps)=>{
    camps.forEach((camp_)=>{
      console.log(camp_);
      x = new Date(camp_.date_creation);
      x.setDate(x.getDate() + 7);
      if(x.getTime()- new Date().getTime() > 0){
        arr.push(camp_);
        //console.log(camp_.date_creation);
      }else{
        //console.log("ok");
        if(!camp_.fini){
          let obj = {fini: true};
        camp.findByIdAndUpdate(camp_._id, obj, (err, camp_)=>{
          // console.log(camp_);
          // console.log("inside")
        });
        }
      }
    });
    res.render("camps", {camps: arr, key: false, add: true, id: req.params.id});
  });
  // let enfant_arr= [];
  //   camp_eleve.find({camp: req.params.id}, (err, camp)=>{
  //   enfant.find({store: false}, (err, allEnfant)=>{
  //     if(camp[0])
  //       allEnfant.forEach((enfant)=>{
  //         if(camp[0].eleve.includes(enfant._id)){
  //           console.log("ok");
  //           enfant_arr.push(enfant);
  //         }
  //       });
  //     res.render("camp-show", {camp: req.params.id, enfant: enfant_arr});
  //   });
  // })
});

app.get("/dashboard/camps-historique/:id", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let enfant_arr= [];
    camp_eleve.find({camp: req.params.id}, (err, camp)=>{
    enfant.find({}, (err, allEnfant)=>{
      if(camp[0])
        allEnfant.forEach((enfant)=>{
          if(camp[0].eleve.includes(enfant._id)){
            console.log("ok");
            enfant_arr.push(enfant);
          }
        });
      res.render("camp-show-historique", {camp: req.params.id, enfant: enfant_arr});
    });
  })
});

//english after school


app.get("/dashboard/english-after-school", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let enfant_arr = [];
  english.findOne({location: req.user.location}, async(err, english_af)=>{
    if(english_af != null){
      console.log("not empty!");
      console.log(english_af);
      await Promise.all(english_af.eleve.map(async (id)=>{
        console.log(id);
        await enfant.findById(id, (err, enfant)=>{
          console.log(enfant);
           enfant_arr.push(enfant);
        });
      }));
      console.log(enfant_arr);
      res.render("english-after-school", {enfant: enfant_arr});
      }else
      res.render("english-after-school", {enfant: enfant_arr});
  });
});


//add enfant to english after school

app.get("/dashboard/english-after-school/add", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let enfant_arr = [];
  enfant.find({location: req.user.location}, (err, allEnfant)=>{
    if(!Array.isArray(allEnfant)){
      allEnfant = [allEnfant];
      console.log(allEnfant);
    }
      english.findOne({location: req.user.location}, (err, english_af)=>{
        if(!english_af){
          res.render("add-enfant-english", {enfant:allEnfant});
        }else{
          console.log("english after school:"+english_af);
        allEnfant.forEach((enfant)=>{
          console.log("enfant:"+enfant);
            if(!english_af.eleve.includes(enfant._id)){
              enfant_arr.push(enfant);
            }
        });
        res.render("add-enfant-english", {enfant:enfant_arr});
      }
    });
    });
});

app.post("/english-after-school/add", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{

  if(!Array.isArray(req.body.class_check)){
    english.findOne({location: req.user.location},(err, eas)=>{
      let arr = eas.eleve;
      console.log(arr);
      arr.push(req.body.class_check);
      eas.eleve = arr;
      console.log(eas.eleve);
      eas.save((err)=>{});
      res.redirect("/dashboard/english-after-school");
    });
  }else{
    english.findOne({location: req.user.location},(err, eas)=>{
      let arr = eas.eleve;
      arr.concat(req.body.class_check);
      eas.eleve = arr;
      console.log(arr);
      eas.save((err)=>{});
      res.redirect("/dashboard/english-after-school");
    });
  }
});

//finance page

app.get("/dashboard/finance", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let inscription = [0,0,0,0,0,0,0,0,0,0,0,0], dinscription = [0,0,0,0,0,0,0,0,0,0,0,0], nbr_classe = [], paye = [], impaye = [], garcon = 0, fille = 0;
  historique.find({}, (err, historique)=>{
    test = "aymane";
    if(historique){
      historique.forEach((item)=>{
        let index_inscription = (item.date_inscription).getMonth();
        if(item.date_quitte){
          let index_desinscription = (item.date_quitte).getMonth();
          dinscription[index_desinscription] = dinscription[index_desinscription]+1;
        }
        inscription[index_inscription] = inscription[index_inscription]+1;
      });
      kipina.findOne({nom: req.user.location}, (err, kipina)=>{
        for(let i=0;i<kipina.nbr_classe;i++){
          paye[i] = 0;
          impaye[i] = 0;
        }
    enfant.find({location: req.user.location}, (err, allEnfant)=>{
        allEnfant.forEach((enfant)=>{
          if(enfant.sexe == 1)
          garcon++;
          else
          fille++;
          for(let i=0;i<kipina.nbr_classe;i++){
            if(enfant.classe == i)
              if(enfant.payement){
                paye[i] +=1;
              }else{
                impaye[i] +=1;
              }
          }
        });
        console.log(kipina.nbr_classe);
        res.render("finance", {inscription: inscription, nbr_classe: kipina.nbr_classe, paye: paye, impaye: impaye, garcon:garcon,
        fille:fille, dinscription:dinscription});
      });
    });
    }
  });
});

app.get("/dashboard/finance/facture", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  enfant.find({location: req.user.location, payement: false}, (err, enfant)=>{
    res.render("facture", {enfant:enfant});
  });

});

app.post("/facture", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let pere_, mere_, remise, count1, count2, inscription;
  payement.countDocuments({eleve: req.body.class_check}, (err, count)=>{
    count1 = count;
  });
  impaye.countDocuments({eleve: req.body.class_check}, (err, count)=>{
    count2 = count;
  });
  enfant.findById(req.body.class_check, async (err, enfant_)=>{
    if(err || !enfant_)
    res.redirect("/dashboard/finance/facture");
    impaye.find({eleve: enfant_._id}, async (err, impaye)=>{
      console.log(impaye);
      if(err || !impaye)
        res.redirect("/dashboard/finance/facture");
      else{
        if(enfant_.payement){
          res.redirect("/dashboard/finance");
        }
        if((-count1 + count2) == 1){
          let obj = {payement: true};
          await enfant.findByIdAndUpdate(req.body.class_check, obj, (err, enfant)=>{});
        }
        prix.findOne({location: req.user.location}, async (err, prix)=>{
          await personne.findById(enfant_.pere, (err, pere__)=>{pere_ = pere__;});
          await personne.findById(enfant_.mere, (err, mere__)=>{mere_ = mere__;});
          if(req.body.remise)
            remise = Number.parseInt(req.body.remise);
          console.log("=>"+mere_);
          console.log("=>"+pere_);
          console.log(prix);
          console.log(impaye);
          if(req.body.inscription){
            inscription = true;
          }else{
            inscription = false;
          }
          res.render("templates/facture", {remise: remise, month: req.body.month, prix:prix, enfant:enfant_, pere: pere_, mere: mere_, impaye:impaye, trajet_unitaire: req.body.trajet_unitaire, cantine_unitaire: req.body.cantine_unitaire,
            mercredi_unitaire: req.body.mercredi_unitaire,
            retart_garde: req.body.retart_garde,
            inscription: inscription,
             retart_paiement: req.body.retart_paiement});
            //  , (err, data)=>{
            //   pdf.create(data, {"format":"A4",
            //   "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./facture-"+enfant._id+".pdf", (err, file)=>{
            //     res.download("facture-"+enfant._id+".pdf", (err)=>{
            //       console.log(err);
            //     });
            //   });
            // });
        });
      }
    });
  });
});

app.get("/dashboard/finance/gestion", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  enfant.find({location: req.user.location}, (err, enfant)=>{
    res.render("no-paye", {enfant: enfant});
  });
});
app.post("/non-paye", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper,(req, res)=>{
  let payement_obj = {payement: false};
  if(Array.isArray(req.body.class_check)){
    req.body.class_check.forEach((id)=>{
      enfant.findByIdAndUpdate(id, payement_obj, (err, enfant)=>{});
      impaye.create({eleve: id, date: Date.now()}, (err, impaye_enfant)=>{});
    });
  }else{
    enfant.findByIdAndUpdate(req.body.class_check, payement_obj, (err, enfant)=>{});
    impaye.create({eleve: req.body.class_check, date: Date.now()}, (err, impaye_enfant)=>{});
  }
  res.redirect("/dashboard/finance");
});

app.get("/dashboard/routine", AccessMiddleware.isLoggedIn, AccessMiddleware.isEducatrice,(req, res)=>{
  enfant.find({location: req.user.location}, (err, enfant)=>{
    res.render("routine", {enfant:enfant});
  });
});
app.post("/add-routine", AccessMiddleware.isLoggedIn, AccessMiddleware.isEducatrice, (req, res)=>{
  const routine_obj = {
    t_am: Number.parseInt(req.body.am),
    t_pm: Number.parseInt(req.body.pm),
    dodo: Number.parseInt(req.body.dodo),
    repas: Number.parseInt(req.body.repas),
    selle: Number.parseInt(req.body.selle)
  };
  const obj = {};
  if(req.body.jour == '1'){
    obj.lundi=routine_obj
  }else if(req.body.jour == '2'){
    obj.mardi=routine_obj
  }else if(req.body.jour == '3'){
    obj.mercredi=routine_obj
  }else if(req.body.jour == '4'){
    obj.jeudi=routine_obj
  }else if(req.body.jour == '5'){
    obj.vendredi = routine_obj
  }
  routine.findOneAndUpdate({eleve: req.body.class_check}, obj, (err, routine)=>{
    console.log(routine);
    res.redirect("/dashboard/routine");
  });
});
app.get("/dashboard/competence", AccessMiddleware.isLoggedIn, AccessMiddleware.isCompetence, (req, res)=>{
  enfant.find({location:req.user.location}, (err, enfant)=>{
    sous_competence.find({location: req.user.location}, (err, sous_competence)=>{
      res.render("competence", {enfant:enfant, sous_competence:sous_competence});
    });
  });
});

const competence_stockage = multer.diskStorage({
  destination: "public/competence/"
});
const upload_competence = multer({storage: competence_stockage});


app.post("/competence", AccessMiddleware.isLoggedIn, AccessMiddleware.isCompetence, upload_competence.single("image_competence"),(req, res)=>{
  let obj = {};
  if(req.body.enfant){
    obj.eleve = req.body.enfant
    if(req.file){
      obj.image_competence = req.file.filename;
    }
    if(req.body.domaine_competence){
      obj.domaine_competence = Number.parseInt(req.body.domaine_competence);
    }
    if(req.body.competence){
      obj.competence = req.body.competence;
    }
    if(req.body.sous_domaine){
      if(req.body.sous_domaine == 'ajouter'){
        sous_competence.create({location: req.user.location, nom: req.body.nv_competence}, (err, sd)=>{});
        obj.sous_domaine = req.body.nv_competence;
      }else{
        sous_competence.create({location: req.user.location, nom: req.body.sous_domaine}, (err, sd)=>{});
        obj.sous_domaine = req.body.sous_domaine;
      }
    }
    competence.create(obj, (err, result)=>{
      console.log("competence");
      if(err){
        console.log(err);
      }else{
        res.redirect("/dashboard");
        console.log(result);
      }
    });
  }else{
    res.redirect("/dashboard/competence");
  }
});

app.get("/dashboard/list-competence", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let arr = [];
  enfant.find({location: req.user.location}, async (err, allEnfant)=>{
    await Promise.all(allEnfant.map(async (enfant)=>{
      console.log(enfant);
      await competence.findOne({eleve: enfant._id}, (err, competence_)=>{
        console.log(competence_)
        if(competence_){
          console.log("ok");
          arr.push(enfant);
        }
      });
    }));
    console.log(arr);
    res.render("list-competence", {arr:arr});
  });
  
});


app.post("/list-competence", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  competence.find({eleve: req.body.enfant}, (err, competence_)=>{
    console.log(competence_);
    enfant.findById(req.body.enfant, (err, enfant_)=>{
      res.render("templates/competence", {enfant: enfant_, competence: competence_});
      // , (err, data)=>{
      //   pdf.create(data, {"format":"A4",
      // "orientation":'landscape', "width": "3in", timeout: '100000'}).toFile("./competence.pdf", (err, file)=>{
      //   res.download("competence.pdf", (err)=>{
      //   });
      // });
      // });
    });
  });
});
app.get("/dashboard/plan", AccessMiddleware.isLoggedIn, AccessMiddleware.isEducatrice, (req, res)=>{
  res.render("plan");
});
app.get("/dashboard/list-plan", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let arr = [], obj = {};
  try{
    user.find({location: req.user.location}, async (err, allusers)=>{
      await Promise.all(allusers.map(async (user)=>{
        console.log(user);
        await plan.findOne({user: user._id}, (err, plan)=>{
          console.log(plan);
          if(plan){
            obj = {
              nom: user.nom,
              prenom: user.prenom,
              fichier: plan.file
            };
            arr.push(obj);
          }
        });
      }));
      res.render("list-plan", {arr:arr});
    });
  }catch(err){
    res.redirect("/dashboard");
  }
});
const plan_ = multer.diskStorage({
  destination: "public/files/plans/",
  filename: function (req, file, cb) {
    cb(null, "plan-"+req.user.role+ '.docx')
  }
});
const upload_plan = multer({storage: plan_});

app.post("/plan", AccessMiddleware.isLoggedIn, AccessMiddleware.isEducatrice, upload_plan.single("doc"), (req, res)=>{
  const plan_obj = {
    file: req.file.filename
  };
  plan.findOneAndUpdate({user: req.user._id}, plan_obj, (err, plan_)=>{
    if(plan_ == null){
      plan_obj.user = req.user._id;
      plan.create(plan_obj, (err, plan__)=>{
        res.redirect("/dashboard");
      });
    }
    else if(err)
      res.redirect("/dashboard/plan");
    else
      res.redirect("/dashboard/");
  });
});

app.get("/dashboard/users", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector, (req, res)=>{
  user.find({}, (err, users)=>{
    res.render("users", {users:users});
  });
});
app.get("/dashboard/users/:id", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector, (req, res)=>{
  user.findById(req.params.id, (err, user)=>{
    kipina.find({}, (err, kipina)=>{
      res.render("modify-user", {user_:user, kipina:kipina, id:req.params.id});
    });
  });
});

app.post("/modify-user/:id", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector, (req, res)=>{
  const user_obj= {
    username: req.body.username,
    nom: req.body.nom,
    prenom: req.body.prenom,
    role: req.body.role,
    location: req.body.location
  };
  console.log(user_obj);
  user.findByIdAndUpdate(req.params.id, user_obj, (err, user)=>{
    console.log("=>"+user);
    if(req.body.password)
      user.setPassword(req.body.password, (err)=>{
        user.save();
      });
      res.redirect("/dashboard");
  });
});
app.post("/users/delete/:id", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector, (req, res)=>{
  user.findByIdAndRemove(req.params.id, (err, removed)=>{
    res.redirect("/dashboard");
  });
});

app.get("/dashboard/kipinas", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector, (req, res)=>{
  kipina.find({}, (err, kipinas)=>{
    res.render("kipinas", {kipinas:kipinas})
  });
});
app.get("/dashboard/kipinas/:id", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector, (req, res)=>{
  kipina.findById(req.params.id, (err, kipina)=>{
    console.log(req.body.params+"=>"+kipina);
    res.render("modify-kipina", {kipina:kipina, id:req.params.id});
  });
});
app.post("/modify-kipina/:id", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector, (req, res)=>{
  const obj = {
    nom: req.body.nom
  };
  const obj_mod = {
    location: req.body.nom
  } 
  kipina.findById(req.params.id, (err, kipina_)=>{
    camp.updateMany({location:kipina_.nom}, obj_mod, (err, camp_)=>{
    });
    enfant.updateMany({location: kipina_.nom}, obj_mod, (err, enfant)=>{});
    english.updateMany({location: kipina_.nom}, obj_mod, (err, english)=>{});
    prix.updateMany({location: kipina_.nom}, obj_mod, (err, prix)=>{});
    user.updateMany({location: kipina_.nom}, obj_mod, (err, user)=>{});
  });
  kipina.findByIdAndUpdate(req.params.id, obj, (err, kipina)=>{
    res.redirect("/dashboard");
  });
});

// app.get("/dashboard/finance/gestion", AccessMiddleware.isLoggedIn,  AccessMiddleware.isSuper, (req, res)=>{
//   res.render("no-paye");
// });
app.get("/dashboard/paye", AccessMiddleware.isLoggedIn,  AccessMiddleware.isSuper,(req, res)=>{
  enfant.find({location: req.user.location, payement:false}, (err, enfant)=>{
    res.render("paye", {enfant:enfant});
  });
});

app.post("/paye", AccessMiddleware.isLoggedIn,  AccessMiddleware.isSuper, (req, res)=>{
  const obj = {
    date_payement: req.body.date,
    type_payement: req.body.type,
    eleve: req.body.class_check
  };
  payement.create(obj, (err, payement)=>{
    if(req.body.final){
      const final = {payement: true};
      if(req.body.inscription)
        final.inscription = true;
      enfant.findByIdAndUpdate(req.body.class_check, final, (err, final)=>{});
    }
    if(err || !payement)
      res.redirect("/dashboard");
    else
      res.redirect("/dashboard/finance");
  });
});

app.get("/dashboard/modification/mere/:id", AccessMiddleware.isLoggedIn,  AccessMiddleware.isSuper, (req, res)=>{
  personne.findById(req.params.id, (err, mere)=>{
    res.render("mere-modification", {mere: mere});
  });
});
app.get("/dashboard/modification/pere/:id", AccessMiddleware.isLoggedIn,  AccessMiddleware.isSuper, (req, res)=>{
  personne.findById(req.params.id, (err, pere)=>{
    res.render("pere-modification", {pere: pere});
  });
});

app.post("/modification-pere/:id", AccessMiddleware.isLoggedIn,  AccessMiddleware.isSuper, (req, res)=>{
  const pere_obj = {
    nom: req.body.p_nom,
    prenom: req.body.p_prenom,
    courriel: req.body.p_courreil,
    nationalite: req.body.p_nationalite,
    profession: req.body.p_profession,
    telephone: req.body.p_tele,
    num_rue: req.body.p_n_rue,
    rue: req.body.p_rue,
    quartier: req.body.p_quartier,
    ville: req.body.p_ville,
    pays: req.body.p_pays,
    cin_passport: req.body.p_id
  };
  personne.findByIdAndUpdate(req.params.id, pere_obj, (err, pere)=>{
    res.redirect("/dashboard/modification");
  });
});

app.post("/modification-mere/:id", AccessMiddleware.isLoggedIn,  AccessMiddleware.isSuper, (req, res)=>{
  const mere_obj = {
    nom: req.body.p_nom,
    prenom: req.body.p_prenom,
    courriel: req.body.p_courreil,
    nationalite: req.body.p_nationalite,
    profession: req.body.p_profession,
    telephone: req.body.p_tele,
    num_rue: req.body.p_n_rue,
    rue: req.body.p_rue,
    quartier: req.body.p_quartier,
    ville: req.body.p_ville,
    pays: req.body.p_pays,
    cin_passport: req.body.p_id
  };
  personne.findByIdAndUpdate(req.params.id, mere_obj, (err, mere)=>{
    res.redirect("/dashboard/modification");
  });
});

app.get("/dashboard/finance/facture/modifier-prix", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector, (req, res)=>{
  prix.find({location: req.user.location}, (err, prix)=>{
    res.render("prix", {prix:prix});
  });
});
app.post("/modify-price/:nom", AccessMiddleware.isLoggedIn, AccessMiddleware.isDirector, (req, res)=>{
  const prix_obj = {
    inscription: req.body.inscription,
    scolarite_ancien: req.body.scolarite_ancien,
    scolarite_nv: req.body.scolarite_nv,
    cantine4: req.body.cantine4,
    cantine5: req.body.cantine5,
    cantine_unitaire: req.body.cantine_unitaire,
    garde: req.body.garde,
    mercredi: req.body.mercredi,
    mercredi_unitaire: req.body.mercredi_unitaire,
    aller_retour: req.body.aller_retour,
    trajet: req.body.trajet,
    trajet_unitaire: req.body.trajet_unitaire
  };
  prix.findOneAndUpdate({location: req.params.nom}, prix_obj, (err, prix)=>{
    res.redirect("/dashboard/finance/facture");
  });
});

app.get("/dashboard/historique", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let enfant_arr = [];
      historique.find({}, (err, item_)=>{
        res.render("historique", {enfant:item_});
      });
});

app.post("/dashboard/delete/:id1/:id2", (req, res)=>{
  camp_eleve.findOne({camp: req.params.id1}, (err, item)=>{
    let index = item.eleve.indexOf(req.params.id2);
    let tmp = item.eleve;
    tmp.splice(index, 1);
    if(index > -1){
      obj = {eleve: tmp};
    camp_eleve.findOneAndUpdate({camp: req.params.id1}, obj, (err, item)=>{
      res.redirect("/dashboard/camps/"+req.params.id1);
    });
    }
  });
});

app.post("/delete/eas/:id2", (req, res)=>{
  english.findOne({location: req.user.location}, (err, item)=>{
    let index = item.eleve.indexOf(req.params.id2);
    let tmp = item.eleve;
    tmp.splice(index, 1);
    if(index > -1){
      obj = {eleve: tmp};
    english.findOneAndUpdate({location: req.user.location}, obj, (err, item)=>{
      res.redirect("/dashboard/english-after-school");
    });
    }
  });
});
app.post("/dashboard/restore/:id", (req, res)=>{
  let obj = {store: true};
  enfant.findByIdAndUpdate(req.params.id, obj, (err, enfant_)=>{
    if(err)
      res.redirect("/dashboard");
    else{
      let tmp = [];
      let obj = {date_quitte: Date.now(), id: req.params.id};
      if(!Array.isArray(req.body.choix)){
        tmp = [req.body.choix];
        obj.choix = tmp;
      }else{
        tmp = req.body.choix;
        obj.choix = tmp;
      }if(req.body.autre !== ''){
        obj.autre = req.body.autre;
      }
      historique.findOneAndUpdate({nom: enfant_.nom, prenom: enfant_.prenom}, obj, (err, historique)=>{});
      res.redirect("/dashboard/modification");
    }
  });
});



app.get("/dashboard/classe/:number", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  enfant.find({location: req.user.location, classe: req.params.number, store: false}, (err, result)=>{
    res.render("enfant_modification", {enfant: result, key: false});
  });
});

app.get("/dashboard/modification/classe/:number", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  enfant.find({location: req.user.location, classe: req.params.number, store: false}, (err, result)=>{
    res.render("enfant_modification", {enfant: result, key: true});
  });
});

app.get("/dashboard/enfant/:id", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  enfant.findById(req.params.id, (err, result)=>{
    urgence.findOne({eleve: result._id}, (err, urgence_)=>{
      medical.findOne({eleve: result._id}, (err, medical_)=>{
        personne.findById(result.pere, (err, pere_)=>{
          personne.findById(result.mere, (err, mere_)=>{
            res.render("profile", {enfant: result, urgence: urgence_, medical: medical_, pere: pere_, mere: mere_});
          });
        });
      });
    });
  });
});

app.post("/facture/:id", (req, res)=>{
    // enfant.findById(req.params.id, (err, result)=>{
    //     res.json(result);
    // });
    let obj = {}, total = 0, status = "", cash = 0;
    if(req.body.inscription){
      obj.inscription = 6000;
      total += obj.inscription;
    }
    if(req.body.ancien){
      obj.ancien = 3200;
      total += obj.ancien;
    }if(!req.body.ancien){
      obj.ancien = 3400;
      total += obj.ancien;
    }
    if(req.body.remise){
      obj.remise = req.body.remise;
      total  -= (total*(obj.remise/100));
    }
    if(req.body.test){
      obj.test = req.body.test;
      total  -= obj.test;
    }
    if(req.body.check){
      obj.num_cheque = req.body.num_cheque;
      obj.cheque_montant = req.body.cheque_montant;
      cash += req.body.cheque_montant;
    }
    if(req.body.cash){
      obj.cash_montant = req.body.cash_montant;
      cash += req.body.cash_montant;
    }
    if(req.body.virement){
      obj.virement_montant = req.body.virement_montant;
      obj.virement_serie = req.body.virement_serie;
      cash += req.body.virement_montant;
    }
    if(cash - total == 0){
      status = "paiement valide!";
    }else{
      status = "montant incorrect";
    }
    res.json({
      "objet": obj,
      "total": total,
      "cash": cash,
      "message": status
    });
});

//new camps pages 


app.get(
	"/dashboard/camps-home/",
	AccessMiddleware.isLoggedIn,
	AccessMiddleware.isSuper,
	(req, res) => {
		res.render("camps/camps-home");
	}
);

app.get(
	"/dashboard/camps-rapport/",
	AccessMiddleware.isLoggedIn,
	AccessMiddleware.isSuper,
	(req, res) => {
		res.render("camps/camps-rapport");
	}
);
app.get(
	"/dashboard/camps-rapport-cantine/",
	AccessMiddleware.isLoggedIn,
	AccessMiddleware.isSuper,
	(req, res) => {
		res.render("camps/camps-rapport-cantine-choose-camps");
	}
);

app.get(
	"/dashboard/camps-rapport-list-camps",
	AccessMiddleware.isLoggedIn,
	AccessMiddleware.isSuper,
	(req, res) => {
		res.render("camps/camps-rapport-camps");
	}
);

app.get(
	"/dashboard/camps-rapport-paye",
	AccessMiddleware.isLoggedIn,
	AccessMiddleware.isSuper,
	(req, res) => {
		res.render("camps/camps-rapport-payes");
	}
);
app.get(
	"/dashboard/camps-rapport-impaye",
	AccessMiddleware.isLoggedIn,
	AccessMiddleware.isSuper,
	(req, res) => {
		res.render("camps/camps-rapport-impayes");
	}
);

app.get(
	"/dashboard/camps-rapport-allergie",
	AccessMiddleware.isLoggedIn,
	AccessMiddleware.isSuper,
	(req, res) => {
		res.render("camps/camps-rapport-allergie");
	}
);

app.get(
	"/dashboard/camps-rapport-email",
	AccessMiddleware.isLoggedIn,
	AccessMiddleware.isSuper,
	(req, res) => {
		res.render("camps/camps-rapport-email");
	}
);

app.get(
	"/dashboard/camps-rapport-transport",
	AccessMiddleware.isLoggedIn,
	AccessMiddleware.isSuper,
	(req, res) => {
		res.render("camps/camps-rapport-transport");
	}
);

app.get(
	"/dashboard/camps-paiment",
	AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper,
	(req,res) => {
		res.render("camps/camps-paiment");
	}
);



app.post("/sous-camps/:id", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  camp.findById(req.params.id, (err, camp_)=>{
    if(camp_.create_scamp == camp_.nbr_jrs){
      res.redirect("/dashboard/camps/"+req.params.id);
    }else{
      camp.findByIdAndUpdate(req.params.id, {$inc : {'create_scamp' : 1}}).exec((err, camp_)=>{
        let obj = {
          camp: req.params.id,
          date_creation: Date.now(),
        };
        sous_camp.create(obj, (err, scamp_)=>{
          camp_eleve.create({camp: scamp_._id, eleve: []}, (err, result)=>{});
          console.log(scamp_._id);
          res.redirect(`/dashboard/camps/${req.params.id}/${scamp_._id}`);
        });
      });
    }
  });
});

app.get("/dashboard/camps/:id1/:id2", AccessMiddleware.isLoggedIn, AccessMiddleware.isSuper, (req, res)=>{
  let enfant_arr = [];
  camp_eleve.findOne({camp: req.params.id2}, async(err, result)=>{
    console.log(result);
    if(!err || Object.keys(result).length != 0)
    for(let item of result.eleve){
      await enfant.findById(item, (err, result_)=>{
        if(!err || Object.keys(result_).length != 0)
          enfant_arr.push(result_);
      });
    }
    console.log(enfant_arr);
    res.render("camp-show", {camp: req.params.id2, enfant: enfant_arr, add: true, id: req.params.id2});
  });
});