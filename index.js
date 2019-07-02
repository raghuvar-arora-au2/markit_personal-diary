if(process.env.MY_DB)
    var url = process.env.MY_DB
else
    var url = "mongodb://127.0.0.1:27017/"

// var url = "mongodb://127.0.0.1:27017/"

var express = require('express');
var expressSession = require('express-session');
const bodyParser = require('body-parser');
var notes = require('./notes.js') 
var hbs = require('express-handlebars');
var mongoClient = require('mongodb').MongoClient

var app = express();

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
    console.log("database connected!")   
})

app.use(bodyParser.json());

app.use(express.static('./public'));

app.post('/',function(req,res){
    res.reindirect('index.html');
})


// app.get('/logout', function (req, res) {
//    req.session.user = null;
//    req.session.destroy();
// });


app.engine('hbs', hbs({extname:'hbs'}))
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views')


app.use('/notes', notes)

// heroku app will run on '/'?
// app.get('/', function(req, res){
//     res.redirect('/notes')
// })

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
