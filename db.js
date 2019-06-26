const mongoose = require('mongoose');

var usersSchema = new mongoose.Schema({
    username:{
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    }
});
mongoose.model('users',usersSchema);