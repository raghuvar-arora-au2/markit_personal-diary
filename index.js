var notes = require('./notes.js') 
var express = require('express');
var hbs = require('express-handlebars');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient

var app = express();

if(process.env.MY_DB){
    var url = process.env.MY_DB
}
else
    var url = "mongodb://127.0.0.1:27017/"

mongoClient.connect(url, {useNewUrlParser : true}, function(err, client){
    if(err) throw err    
    app.locals.db = client.db('markit')   
    console.log("database connected!")   
})

app.engine('hbs', hbs({extname:'hbs'}))
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views')


app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));

app.use('/notes', notes)

// heroku app will run on '/'?
app.get('/', function(req, res){
    res.redirect('/notes')
})

app.listen(process.env.PORT || 3000);

