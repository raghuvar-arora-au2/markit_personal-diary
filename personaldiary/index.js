var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017');
var express = require('express');
var expressSession = require('express-session');
var app = express();
var db = mongoose.connection;

app.use(express.static('public'));

app.post("/",function(req,res){
    res.end("Registration Succesfully Completed!");

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function (callback) {
        console.log("connected.")
    });

    var RegSchema = mongoose.Schema({
        Email: String,
        Pass: String,
        repass: String,
        
        reg_time : {
            type : Date, default: Date.now
        }
    }, { collection: 'AddressCol' });

    var UserReg = mongoose.model('UserReg', RegSchema);

    var UserAdd = new UserReg({
        Email: req.body.email,
        Pass: req.body.pass,
        rePass: req.body.repass,
    });

    UserAdd.save(function (err, fluffy) {
        if (err) return console.error(err);
    });
});
app.post('/login', function (req, res, next) {
    var email = req.body.email;
    var pass = req.body.pass;
 
    User.findOne({Email: email, Pass: pass}, function(err, user) {
       if(err) return next(err);
       if(!user) return res.send('Not logged in!');
 
       req.session.email = email;
      // return res.send('Logged In!);
    });
});
 
 app.get('/logout', function (req, res) {
    req.session.user = null;
 });


app.listen(3000);