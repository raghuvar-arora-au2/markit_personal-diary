if(process.env.MY_DB){
    var url = process.env.MY_DB
}
else
    var url = "mongodb://127.0.0.1:27017/"


var express = require('express');
var session = require('express-session');
const bodyParser = require('body-parser');
var notes = require('./notes.js') 
var hbs = require('express-handlebars');
var mongoClient = require('mongodb').MongoClient

var app = express();

mongoClient.connect(url, {useNewUrlParser : true}, function(err, client){
    if(err) throw err    
    app.locals.db = client.db('markit')   
    console.log("database connected!")   
})

app.use(bodyParser.json());

app.use(express.static('./public'));

app.use(session({
    secret: "this is some secret"
}));

app.post('/sign_up' ,function(req,res){
    var name = req.body.name;
    var username = req.body.username;
	var email= req.body.email;
    var pass = req.body.password;
    var cmpass = req.body.cpassword;
	var password = getHash( pass , phone ); 				

	var data = {
        "name":name,
        "usename":username,
		"email":email,
        "password": password,
        "cpassword":cpassword,
	}
		console.log("connected to database successfully");
		//CREATING A COLLECTION IN MONGODB USING NODE.JS
		app.locals.db.collection("users").insertOne(data, (err , collection) => {
			if(err) throw err;
			console.log("Record inserted successfully");
			console.log(collection);
		});
	
	console.log("DATA is " + JSON.stringify(data) );
	res.set({
		'Access-Control-Allow-Origin' : '*'
	});
    return res.redirect('./index.html');  
})

app.post('/',function(req,res){
    if(req.session.loggedIn == "true") {
        res.redirect('/notes');
    }
    else
    {
        res.redirect('./index.html');
    }
});

app.post('/login',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    if(username =='username' && password =='password') {
        req.session.loggedIn = "true";
        res.json({success_message: "Logged in Successfully!"});
        res.redirect("/index.html");
    }
});

app.engine('hbs', hbs({extname:'hbs'}))
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views')



app.use('/notes', notes)

// heroku app will run on '/'?
// app.get('/', function(req, res){
//     res.redirect('/notes')
// });

app.listen(process.env.PORT || 3000);
