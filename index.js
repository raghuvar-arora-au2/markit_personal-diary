/* eslint-disable no-unused-vars */
/* eslint-disable no-redeclare */
/* eslint-disable semi */
if(process.env.MY_DB)
	var url = process.env.MY_DB
else{
	var url = "mongodb://raghuvar:qwert123@ds243418.mlab.com:43418/sample";
}

var express = require("express");
var session = require("express-session");
const bodyParser = require("body-parser");
var notes = require("./notes.js") 
var hbs = require("express-handlebars");
var mongoClient = require("mongodb").MongoClient;
var passport =require( "passport")
var fetch=require("node-fetch")

var app = express();

var  json =require("body-parser");
app.use(json());

// eslint-disable-next-line no-unused-vars
const multipart = require( "connect-multiparty" );

const cloudinary = require( "cloudinary" );
const resolve = require( "path" );
const { multerUploads, dataUri } = require( "./middlewares/multer" );
// import { resolve } from  'path';
// import { uploader, cloudinaryConfig } from './config/cloudinaryConfig'
// var config=require("./config/cloudinaryConfig");
// const cloudinaryConfig=config.cloudinaryConfig;
const { uploader, cloudinaryConfig } = require( "./config/cloudinaryConfig" );

app.use( "*", cloudinaryConfig );


mongoClient.connect(url, {useNewUrlParser : true}, function(err, client){
	if(err) throw err    
	app.locals.db = client.db("sample")
	app.locals.db.createCollection("users")   
	console.log("database connected!")   
})

app.use(bodyParser.json());

app.use(session({secret:"dfsdfa"}));

// custom mw shud have next()
app.get("/", function(req, res, next){
	if (req.session.user) {
		res.redirect("/notes")
	}
	else
		next()
});

// app.get('/', function(req, res){
app.use("/", express.static("./public"));
// });


app.use(bodyParser.urlencoded({ 
	extended: true
})); 

app.engine("hbs", hbs({extname:"hbs"}))
app.set("view engine", "hbs");
app.set("views", __dirname + "/views")


app.post("/signup" ,function(req,res){
	var name = req.body.name;
	var username = req.body.username;
	var email = req.body.email;
	var password = req.body.password;				

	var data = {
		"name":name,
		"username":username,
		"email":email,
		"password": password
	}

	req.app.locals.db.collection("users").findOne({
		username: req.body.username,
		// password: req.body.password
		email:email
		
	}, function (err, users) {
		console.log("pass:"+users)
		if(err){
			// console.log(" no exist");
			res.redirect("/");
			console.log("ERROR");
			throw err;
			
		}
		else if(users!=null){
			// req.session.user = true;
			// req.session.name = username;
			console.log(" exist");
			// res.redirect("/notes");
			res.render("altLogin",{layout: false,type:"warning",message:"The account already exists!", username:req.body.username})
		}
		else{
			req.app.locals.db.collection("users").insertOne(data, function(err, collection) {
				if(err){
					console.log("HERE");
					throw err;
				}
				console.log("record is successfully registered");
			});
			// res.redirect("/login");
			res.render("altLogin",{layout: false,type:"warning",message:"Please login to continue!", username:req.body.username})
		}
		
	});

	
})

app.get("/login",(req, res)=>{
	res.sendFile(__dirname+"/public/login.html");
})

app.post("/login", function (req, res) {
	var username = req.body.username;
	var password = req.body.password;
	var data = {
		"username":username,
		"password":password
	}
	console.log("checking if user exists or not ...")
	req.app.locals.db.collection("users").findOne({
		username: req.body.username,
		password: req.body.password
		
	}, function (err, users) {
		console.log("pass:"+users)
		if(err){
			// console.log(" no exist");
			res.redirect("/");
			console.log("ERROR");
			throw err;
			
		}
		else if(users!=null){
			req.session.user = true;
			req.session.name = username;
			console.log(" exist");
			res.redirect("/notes");
		}
		else{
			console.log(" no exist");
			// throw err;
			// res.redirect("/badlogin");
			res.render("altLogin",{layout: false,type:"danger",message:"incorrect username or password", username:req.body.username})
		}
	});
})

app.get("/logout", function (req, res) {
	req.session.destroy();
	res.redirect("/");
});



app.use("/notes", notes)

// heroku app will run on '/'?
// app.get('/', function(req, res){
//     res.redirect('/notes')

app.delete("/delete", multerUploads,(req,res)=>{
	let id=req.body.id;
	let path=req.body.path;
	uploader.destroy(path+"/"+id).then(result=>{
		console.log(result);
		res.send(200);
	});
})

app.post( "/upload", multerUploads, ( req, res ) => {
	if ( 1 ) {
		// console.log(req.file);
		if ( req.file ) {
			// console.log("dfsdfsd");
			let path=req.body.path
			const file = dataUri( req ).content;
			return uploader.upload( file, () => { }, { resource_type: "auto", folder: path } ).then( ( result ) => {
				const image = result.url;
				console.log(image);
				return res.status( 200 ).json( {
					messge: "Your image has been uploded successfully to cloudinary",
					data: {
						result,
					},
				} );
			} ).catch( err => res.status( 400 ).json( {
				messge: "someting went wrong while processing your request",
				data: {
					err,
				},
			} ) );
		}
	}
});

app.get("/badlogin",(req,res)=>{
	res.sendFile(__dirname+"/public/incorrectcredentials.html");
})

app.post("/facebooklogin",async (req, res)=>{
	const{accessToken, userID, name}=req.body
	const response= await fetch(`https://graph.facebook.com/v7.0/me?access_token=${accessToken}&method=get&pretty=0&sdk=joey&suppress_http_code=1`)
	// console.log(`https://graph.facebook.com/v7.0/me?access_token=${accessToken}&method=get&pretty=0&sdk=joey&suppress_http_code=1`)
	const json= await response.json()
	// console.log(req.body)
	// console.log(json.userID+" "+userID)
	json.userID=json.id;
	if(json.userID==userID){
		console.log("valid user");
		//valid user
		let user=req.app.locals.db.collection("users").findOne(
			{
				FacebookID:userID
			}
		)

		if(user){
			// res.json({status:"ok"})
			req.session.user = true;
			req.session.name = json.name;
			res.redirect("/notes");
		}
		else{
			var data = {
				"name":json.name,
				"username":json.name,
				"email":json.name,
				accessToken,
				FacebookID:userID
			}
			req.app.locals.db.collection("users").insertOne(data, function(err, collection) {
				if(err){
					console.log("HERE");
					throw err;
				}
				console.log("record is successfully registered");
				req.session.user = true;
				req.session.name = json.name;
				res.redirect("/notes")
			});
		}

	}
	else{
		//DO NOT LOGIN
		console.log("invalid user");

	}

})

app.get("/")

app.listen(process.env.PORT || 3000, ()=>{
	console.log("Server started.");
});
//app.listen(3000);
