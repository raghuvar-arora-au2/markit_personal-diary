var express = require('express')
var router = express.Router()
var fs = require('fs')
var mkdirp = require('mkdirp'); 
var showdown = require('showdown');
converter = new showdown.Converter();

router.get('/', function(req, res) {
    var user = "abc2" // req.session.name
    // var folders = []  
    var notes = [] 
    req.app.locals.db.collection('notes').find({"user_id":user}).toArray(function(err, docs){
        if(docs){
            docs.forEach(function(e,i){
                notes.push(e.note)
                console.log(notes)
            }) 
        }
        
        // why does res exist here now?
        console.log("render?")
        res.render('markdown', {notes:notes})     
}
)
})

router.post('/text-to-html', function(req, res){  
    text = req.body.content;
    html = converter.makeHtml(text);  
    res.json(html)
})

router.post('/upsert', function(req, res){
    var user = "abc2" 
    var note = req.body.note
    var content = req.body.content
    var filename = __dirname + '/' + user + '/' + note + '.txt'

    req.app.locals.db.collection('notes').update({user_id:user, note:note}, {$set:{fpath:filename}}, upsert=true, function(err, data){
        if(err) throw err
    })
    
    fs.writeFile(filename, content, 'utf8', function(err, data){
        if(err) throw err
        res.json({}) 
    })
})

// router.post('/edit-folder-name', function(req, res){
//     var user = "abc2"
//     var new_name = req.body.new_name
//     var old_name = req.body.old_name    
//     var new_filename = __dirname + '/' + user + '/' + new_name 
//     var old_filename = __dirname + '/' + user + '/' + old_name

//     fs.rename(old_filename, new_filename, function(err, data){  
//         if(err) throw err             
//         req.app.locals.db.collection('notes').find({"user_id": user, "folder": old_name})
//             .forEach(function(e, i){
//                 e.folder = new_name,
//                 e.fpath = new_filename + "/" + e.note + ".txt";
//                 req.app.locals.db.collection('notes').save(e)
//             })
//     })
// })


router.post('/edit-note-name', function(req, res){
    var user = "abc2"
    var new_name = req.body.new_name
    var old_name = req.body.old_name
    req.app.locals.db.collection('notes').find({"user_id": user, "note": old_name})
        .forEach(function(e, i){
            e.note = new_name,
            old_path = e.fpath
            e.fpath = __dirname + "/" + user + "/" + new_name + ".txt";
            req.app.locals.db.collection('notes').save(e)

            fs.rename(old_path, e.fpath, function(err, data){
                if(err) throw err
        })
    })

})


router.get('/read', function(req, res){
    var user = "abc2"
    var folder = req.query.folder
    var note = req.query.note
    var filename = __dirname + '/' + user

    fs.readFile(filename + '/' + note + '.txt', 'utf8', function(err, data){
        if(err){
            mkdirp(filename, function(err, data){
                if (err) throw err
                // extra space in #pad bcoz i had " " as content
                fs.writeFile(filename + '/' + note + '.txt', "", 'utf8', function(err, data){
                        if(err) throw err
                
                        req.app.locals.db.collection('notes').insert({user_id:user, note:note, fpath:filename + '/' + note + '.txt'}, function(err, data){
                            if(err) throw err
                            console.log("inserted for the 1st time in db....")
                        })

                        res.send("")

                    })
            });    
        }
        else{
            var content = data
            res.send(content)
        }        
    })
})

router.post('/delete-a-note', function(req, res){
    var user = "abc2"
    var note = req.body.note
    var path = '' 
    req.app.locals.db.collection('notes').find({"user_id":user, "note":note}).forEach(function(e,i){
        path = e.fpath
        fs.unlink(path, function(err, data){
            if(err) throw err
            console.log("note deleted from file-sys")
        })
        req.app.locals.db.collection('notes').deleteOne({"note":note}, function(err, result){
            if(err) throw err
            console.log("note deleted from db")
            }
        )
    })     
})


module.exports = router