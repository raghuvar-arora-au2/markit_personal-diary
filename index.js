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

	var data = {
        "name":name,
        "username":username,
		"email":email,
        "password": password
    }
    req.app.locals.db.collection('users').insertOne(data, function(err, collection) {
    if(err) throw err
    console.log("Record inserted Successfully");
     
    });
    res.redirect('/index.html'); 
})

app.post('/login', function (req, res) {

    req.app.locals.db.collection('users').findOne({
        username: req.body.log_username,
        password: req.body.log_password
    }, function (err, users) {
        if (users!== 0) {
            console.log("user exists");
            res.redirect('/notes'); // main page url
        }
        else {
            console.log("no exist");
            res.redirect('/index.html');
        }
    });

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
