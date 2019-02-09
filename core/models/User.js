// Requires
const db = require('../services/DB');

const userSchema = new db.Schema({
    name: {
        type: String,
        required: true,
        minlength: 1,
        match: /\w+/,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 4
    },
    image: {
        type: String,
        required: true
    }
});
const User = db.model('user', userSchema);

module.exports = User;