var express = require("express")
var router = express.Router()
//var fs = require('fs')
//var mkdirp = require('mkdirp'); 
var showdown = require("showdown")
var converter = new showdown.Converter()

// https://stackoverflow.com/questions/39000904/what-happens-if-you-overload-the-same-route-with-express-js
router.get("/", function(req, res, next) {
	if(req.session.user){
		var user = req.session.name
		// var folders = []
		console.log(user)  
		var notes = [] 

		// if foldername is null, replace it with "unknown"

		req.app.locals.db.collection("notes").updateMany({user_id:user, folder:null}, {$set:{folder:"unknown"}}, function(err, data){
			if(err) throw err
			console.log("null folders -> unknown updated in db!")
		})

		// user : abc2 ? 
		// what if no result found? not rendering anything?
		req.app.locals.db.collection("notes").aggregate([
			{
				$match: {
					"user_id":user
				}
			},
			{
				$group: {
					_id: "$folder", 
					notes: { $push: "$note" }
				}
			}
		]).toArray(function(err, data){
			console.log("rendering the notes page!")
			res.render("markdown", {fs:data, username:user})
			// next()
			// return;
		}
		)
	}

	else

		next()
 
})


router.get("/", function(req, res){
	// if(!req.session.user){
	// res.redirect was throwing error - headers already sent
	res.redirect("/index.html")
	// }
})


router.post("/text-to-html", function(req, res){  
	text = req.body.content
	html = converter.makeHtml(text)  
	res.json(html)
})

router.post("/update", function(req, res){
	var user = req.session.name 
	var note = req.body.note
	var content = req.body.content
	var foldername = req.body.folder
	// text=content in $set - bcoz we search using user-id and note
	// update() or updateOne()?
	console.log(note, content)
	req.app.locals.db.collection("notes").updateOne({user_id:user, folder:foldername, note:note}, {$set:{text:content}}, function(err, data){
		if(err) throw err
		console.log("noted updated in db!", data)
		res.json({})
	})
    
})

router.post("/edit-folder-name", function(req, res){
	var user = req.session.name
	var new_name = req.body.new_name
	var old_name = req.body.old_name          
	req.app.locals.db.collection("notes").updateMany({"user_id": user, "folder": old_name}, {$set:{"folder":new_name}}, function(err, data){
		if(err) throw err
		console.log("updated folder name in db", "from -", old_name, "to -", new_name)
		res.json({})
	})
	//     .forEach(function(e, i){
	//         e.folder = new_name,
	//         req.app.locals.db.collection('notes').save(e)
	//         console.log("updated folder name in db", "from -", old_name, "to -", new_name)
	// })
})


router.post("/edit-note-name", function(req, res){
	var user = req.session.name
	var new_name = req.body.new_name
	var old_name = req.body.old_name
	var folder = req.body.folder
	req.app.locals.db.collection("notes").find({"user_id": user, "note": old_name, "folder": folder})
		.forEach(function(e, i){
			e.note = new_name,
			req.app.locals.db.collection("notes").save(e)
			console.log("updated note name in db", "from -", old_name, "to -", new_name)
		})
})


router.get("/read", function(req, res){
	var user = req.session.name
	var folder = req.query.folder
	var note = req.query.note
	console.log("{ user_id:",user, ", note:",note, " ,folder:", folder, " }")
	req.app.locals.db.collection("notes").find({user_id:user, note:note, folder:folder}).toArray(function(err, docs){
		if(err) throw err
		if(docs.length){
			console.log(docs[0].text, "doc found, thus sending the stored text")
			var text = docs[0].text
			res.send(text)
		}
		else{
			console.log(docs, "not found, thus inserting")
			req.app.locals.db.collection("notes").insert({user_id:user, note:note, folder:folder, text:""}, function(err, data){
				if(err) throw err
				console.log("inserted for the 1st time in db....")
				res.send("")
			})
		}
	})
})


router.post("/delete-a-note", function(req, res){
	var user = req.session.name
	var note = req.body.note
	var folder = req.body.folder
	req.app.locals.db.collection("notes").deleteOne({"user_id":user, "note":note, folder:folder}, function(err, result){
		if(err) throw err
		console.log("note deleted from db")
	}
	)
})     

router.post("/delete-a-folder", function(req, res){
	var user = req.session.name
	var folder = req.body.folder
	req.app.locals.db.collection("notes").deleteOne({"user_id":user, "folder":folder}, function(err, result){
		if(err) throw err
		console.log("folder and corresponding notes deleted from db")
	}
	)
}) 

module.exports = router