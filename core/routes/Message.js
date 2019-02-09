// Requires
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const moment = require('moment');

//Utils
const myFS = require('../utils/files');

// Models
const User = require('../models/User');
const Message = require('../models/Message');

// Token
const Token = require('../services/Token');

// Config
const app = express();
app.use(bodyParser.json({
    limit: '50mb',
    extended: true,
    type: 'application/json'
}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000,
    type: 'application/x-www-form-urlencoding'
}));
const router = express.Router();
const baseImagePath = '/images/message';

/**
 * POST: Messages.
 * Request: { "message": String, "image": String, "sent": Date }
 * Response: { "ok": Boolean, "message": Message }
 * Message: { "_id": String, "from": User._id, "to": User._id, "message": String, "sent": Date, "__v": Number }
 * Response Error: { "ok": Boolean, "error": String }
 *
 * This service sends a new message to a user. The user sending the message is the one
 * that is logged (you can get that information from the token) and the destination user id is
 * received as a parameter. The JSON data you must send to the service is the text, image
 * (optional) and the current date when the message is sent.
 */
router.post('/:toUserId', (req, res) => {

    const token = req.headers['authorization'].replace('Bearer ', '');
    const dataToken = Token.validateToken(token);

    if (dataToken) {

        if (dataToken.exp < new Date().getTime()) {
            const d = new moment();
            const newMessage = new Message();
            let imagePath = `${baseImagePath}/${d.format('YYYY/MM/DD')}`;
            myFS.mkdir('.' + imagePath);

            newMessage.from = dataToken.login;
            newMessage.to = req.params.toUserId;
            newMessage.message = req.body.message;
            newMessage.image = 'empty';
            newMessage.sent = req.body.sent;

            newMessage.save().then((result) => {

                // First save user data, and later save de image with de _id as a image's name.
                imagePath += `/${result._id}.jpg`;
                fs.writeFileSync('.' + imagePath, Buffer.from(req.body.image, 'base64'));
                newMessage.image = imagePath;

                newMessage.save().then(() => {
                    Message
                        .find({_id: newMessage._id})
                        .populate('to')
                        .populate('from')
                        .then(dataMessage => {
                            let message = {
                                ok: true,
                                message: dataMessage[0]
                            };
                            res.status(200).send(message);
                        });

                }).catch(err => {

                    let data = {ok: false, error: "Image couldn't be registered"};
                    console.log(req.body);
                    console.log(err);
                    res.status(400).send(data);

                });

            }).catch(err => {

                let data = {ok: false, error: "Message couldn't be sent"};
                console.log(req.body);
                console.log(err);
                res.status(400).send(data);

            });

        } else {

            let data = {ok: false, error: "Token expired"};
            res.status(403).send(data);

        }

    } else {

        let data = {ok: false, error: "Token is not correct"};
        res.status(403).send(data);

    }
});

/**
 * DELETE: Messages.
 * Response: { "ok": Boolean }
 * Response Error: { "ok": Boolean, "error": String }
 *
 * This service deletes the message matching the id received.
 */
router.delete('/:_id', (req, res) => {

    const token = req.headers['authorization'].replace('Bearer ', '');
    const dataToken = Token.validateToken(token);

    if (dataToken) {

        if (dataToken.exp < new Date().getTime()) {

            Message.findById(req.params._id).then(dataMessage => {

                // Remove older image and save new data
                myFS.rmdir('.' + dataMessage.image);
                dataMessage.delete({"_id": req.params._id}).then(() => {

                    let data = {ok: true};
                    res.status(200).send(data);

                }).catch(err => {

                    let data = {ok: false, error: "Error while deleting. Try again in a few minutes."};
                    console.log(err);
                    res.status(500).send(data);

                });

            }).catch(err => {

                let data = {ok: false, error: "Message not found"};
                console.log(err);
                res.status(404).send(data);

            });

        } else {

            let data = {ok: false, error: "Token expired"};
            res.status(403).send(data);

        }

    } else {

        let data = {ok: false, error: "Token is not correct"};
        res.status(403).send(data);

    }

});

/**
 * GET: Messages.
 * Response: { "ok": Boolean, "messages": Array<Message> }
 * Message: { "_id": String, "from": User._id, "to": User._id, "message": String, "sent": Date, "__v": Number }
 * Response Error: { "ok": Boolean, "error": String }
 *
 * This service returns all messages that were sent to the user that is performing the request.
 */
router.get('/', (req, res) => {

    const token = req.headers['authorization'].replace('Bearer ', '');
    const dataToken = Token.validateToken(token);

    if (dataToken) {

        if (dataToken.exp < new Date().getTime()) {

            Message
                .find({to: dataToken.login})
                .populate('to')
                .populate('from')
                .then(dataMessages => {

                    let message = {
                        ok: true,
                        messages: dataMessages
                    };

                    res.status(200).send(message);

                }).catch(err => {

                let data = {ok: false, error: "Error recovering messages. Try again in a few minutes"};
                console.log(err);
                res.status(500).send(data);

            });

        } else {

            let data = {ok: false, error: "Token expired"};
            res.status(403).send(data);

        }

    } else {

        let data = {ok: false, error: "Token is not correct"};
        res.status(403).send(data);

    }

});

module.exports = router;