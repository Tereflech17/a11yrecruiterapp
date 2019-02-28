var express = require("express"),
    app     = express(),
bodyParser  = require("body-parser"),
mongoose    = require("mongoose"),
passport    = require("passport"),
User        = require("./models/user"),
LocalStrategy = require("passport-local"),
methodOverride = require("method-override");


// APP CONFIG
mongoose.connect("mongodb://localhost:27017/a11yrecruiter_app", {useNewUrlParser:true});
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Rusty",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});


// MONGOOSE/MODEL CONFIG
var jobSchema = new mongoose.Schema({
    title: String,
    company:String,
    type: String,
    location: String,
    description: String,
    requirements: String,
    applydate: String
});

var Job = mongoose.model("Job", jobSchema);

//create a blog
// Job.create({
//     title: "Front End Developer, Summer Internship 2019",
//     company: "Portfolio",
//     type: "Part time paid position",
//     location: "Manhattan NY",
//     description: "Portfolio is looking for bright, energetic, and motivated individuals to contribute to ongoing projects. EagleDream's website and web application development projects target a variety of different markets including marketing, research, health care, and retail. Current development leverages a diverse set of tools and technologies including leading web development frameworks, web content management systems (WordPress Drupal), and eCommerce platforms (Shopify). Candidates must have solid understanding of web-based development (HTML, CSS, JavaScript) including experience with responsive web development and take pride in converting creative/designs into pixel perfect web implementations. Database development experience is a plus.",
//     requirements: "Experience applying at least some of the following is preferred but not necessarily required: Relational Databases (PostgreSQL, MySQL, Interbase, etc.), Data Modeling / Entity-Relationship modeling ,Web Services (REST, SOAP, XSDs, JSON), Web Technologies, HTML, JavaScript, CSS, Responsive Front-End Development, Web Application Development Frameworks, Bootstrap, JQuery, AngularJS",
//     applydate:"Apply before Friday 4/31"
// });



// RESTFUL ROUTES


app.get("/", function(req, res){
  res.redirect("/jobs"); 
});


//index route
app.get("/jobs",   function(req, res){
    //retrieve all jobs from the database
    Job.find({}, function(err, jobs){
        if(err){
            console.log("ERROR!!!!");
        }else{
            res.render("index", {jobs: jobs, currentUser: req.user}); 
        }
    });
      
});


//Show route
app.get("/jobs/:id", isLoggedIn,  function(req, res) {
    Job.findById(req.params.id, function(err, foundJob){
       if(err){
           res.redirect("/jobs");
       }else{
           res.render("show", {job: foundJob});
       } 
    })
});



app.get("/about", function(req, res) {
    res.render("about");
})


//AUTH ROUTES

 
 //show register form
 app.get("/register", function(req, res){
     res.render("register");
 });
 
 //handle sign up logic
 app.post("/register", function(req, res){
     var newUser = new User({username: req.body.username});
     User.register(newUser, req.body.password, function(err, user){
         if(err){
             console.log(err);
             return res.render("register");
         }
         passport.authenticate("local")(req, res, function(){
             res.redirect("/jobs");
         });
     });
 });
 
// show login form
app.get("/login", function(req, res){
   res.render("login"); 
});
// handling login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/jobs",
        failureRedirect: "/login"
    }), function(req, res){
});
 




//logout route
app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/jobs");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("A11YRECRUITER SERVER IS RUNNING!");
});