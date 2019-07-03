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
    app.locals.db.createCollection('users')   
    console.log("database connected!")   
})

app.use(bodyParser.json());

app.use(express.static('./public'));
app.use(bodyParser.urlencoded({ 
    extended: true
})); 




app.post('/signup' ,function(req,res){
    var name = req.body.name;
    var username = req.body.username;
	var email = req.body.email;
    var password = req.body.password;
    var cmpassword = req.body.cmpassword;				

	var data = {
        "name":name,
        "username":username,
		"email":email,
        "password": password,
        "cmpassword":cmpassword,
    }
    req.app.locals.db.collection('users').insertOne(data, function(err, collection) {
    if(err) throw err
    console.log("Record inserted Successfully");
     
    });
    res.redirect('/index.html'); 
})



// app.post('/login',function(req,res){
//     var username = req.body.username;
//     var password = req.body.password;
//     if(username =='username' && password =='password') {
//         req.session.loggedIn = "true";
//         res.redirect("/notes");
//     }
// });

app.post('/login',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var data  = {
        username:username,
        password:password
    }
    req.app.locals.db.collection('users').findOne(data, function(err, user) {
        if(user ===null) {
            res.end("Login invalid");
        }
        else if (user.username === req.body.username && user.password === req.body.password){
            res.redirect('/notes');
          } else {
            console.log("Credentials wrong");
            res.end("Login invalid");
          }
        });
})

app.engine('hbs', hbs({extname:'hbs'}))
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views')



app.use('/notes', notes)

// heroku app will run on '/'?
// app.get('/', function(req, res){
//     res.redirect('/notes')
// });

app.listen(process.env.PORT || 3000);
