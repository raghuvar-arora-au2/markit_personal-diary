if(process.env.MY_DB)
    var url = process.env.MY_DB
else
    var url = "mongodb://127.0.0.1:27017/"

var express = require('express');
var session = require('express-session');
const bodyParser = require('body-parser');
var notes = require('./notes.js') 
var hbs = require('express-handlebars');
var mongoClient = require('mongodb').MongoClient

var app = express();
var port = 3000;

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
    app.locals.db = client.db('markit')
    app.locals.db.createCollection('users')   
    console.log("database connected!")   
})

app.use(bodyParser.json());

app.use(express.static('./public'));
app.use(session({
    secret: "Express session secret!"
}));
app.use(bodyParser.urlencoded({ 
    extended: true
})); 

app.use(function(req,res,next){
    console.log(req.method + " " + req.protocol + "://" + req.hostname + port + req.originalUrl);
    console.log("session ID:" + req.session.id);
    console.log(req.body);
    next();
});

app.post('/signup' ,function(req,res){
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
    req.app.locals.db.collection('users').insertOne(data, function(err, collection) {
    if(err) throw err
    res.json("Record inserted Successfully");
     
    });
    res.redirect('/index.html'); 
})

app.get('/', function(req,res){
    if(req.session.loggedIn == "true") {
        res.send("Welcome to the protected page!")
    }
});

app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    req.app.locals.db.collection('users').findOne({
        username:req.body.log_username,
        password:req.body.log_password },
        function(err,users) {
            if(users!==0) {
        res.redirect('/notes');
    }
    else {
        res.redirect('/index.html');
    }
})
    // req.app.locals.db.collection('users').findOne({
    //     username: req.body.log_username,
    //     password: req.body.log_password
    // }, function (err, users) {
    //     if (users!== 0) {
    //         console.log("user exists");
    //         res.redirect('/notes'); // main page url
    //     }
    //     else {
    //         console.log("no exist");
    //         res.redirect('/index.html');
    //     }
    // });

});
app.get('/users', function(req,res){
    if(res.session.login == true) {
        res.send("welcome" + req.session.userName)
    }
    else {
        res.send("You are blocked :(")
    }
})

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/index.html');
});

app.engine('hbs', hbs({extname:'hbs'}))
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views')


app.use('/notes', notes)

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
        console.log(req.file);
        if ( req.file ) {
            console.log("dfsdfsd");
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
} );




app.listen(process.env.PORT || 3000);
// app.listen(3000)
