const mongoose = require('mongoose');

var usersSchema = new mongoose.Schema({
    email: {
        type: String
    },
    password: {
        type: String
    }
});
mongoose.model('users',usersSchema);