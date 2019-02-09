// Requires
const db = require('../services/DB');

const messageSchema = new db.Schema({
    from: {
        type: db.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    to: {
        type: db.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true,
        minlength: 4
    },
    image: String,
    sent: {
        type: Date,
        required: true,
        trim: true,
        minlength: 10
    }
});
const Message = db.model('message', messageSchema);


module.exports = Message;