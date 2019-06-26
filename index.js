var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/27017');
var express = require('express');
var expressSession = require('express-session');
const bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.use(express.static('./public'));

var db = mongoose.connection;

app.get("/signup",function(req,res){
    res.end("Registration Succesfully Completed!");

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function (callback) {
        console.log("connected.")
    });

    var RegSchema = mongoose.Schema({
        Name: String,
        Email: String,
        Username: String,
        Pass: String,
        Num: Number,
        reg_time : {
            type : Date, default: Date.now
        }
    }, { collection: 'AddressCol' });

    var UserReg = mongoose.model('UserReg', RegSchema);

    var UserAdd = new UserReg({
        Name: req.session.name,
        Email: req.session.email,
        Username: req.session.username,
        Pass: req.session.pass,
        Num: req.session.num,
    });


    UserAdd.save(function (err, fluffy) {
        if (err) return console.error(err);
    });
});
app.get('/', function (req, res, next) {
    var user = {
       Name: req.session.name,
       Email: req.body.email,
       Username: req.session.username,
       Pass: req.body.pass,
       Num: req.body.num
   };
   var UserReg = mongoose.model('UserReg', RegSchema);
   UserReg.create(user, function(err, newUser) {
      if(err) return next(err);
      req.session.user = email;
      return res.send('Logged In!');
   });
});
app.get('/',function(req,res){
    res.reindirect('index.html');
})

app.get('/login', function (req, res, next) {
    var username = req.session.username;
    var email = req.sesssion.email;
    var pass = req.session.pass;

   User.findOne({Email: email, Pass: pass}, function(err, user) {
      if(err) return next(err);
      if(!user) return res.send('Not logged in!');

      req.session.name = username;
      req.session.user = email;
      return res.send('Logged In!');
   });
});

app.get('/logout', function (req, res) {
   req.session.user = null;
   req.session.destroy();
});


app.listen(3000);