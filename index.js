var notes = require('./notes.js') 
var express = require('express');
var hbs = require('express-handlebars');
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').MongoClient

var app = express();


mongoClient.connect("mongodb://127.0.0.1:27017/", function(err, client){
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

app.listen(8000);

