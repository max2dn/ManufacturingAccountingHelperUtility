const sign_in = require('express').Router()
const path = require('path')

sign_in.get('/', function(req, res) {
    res.sendFile(path.resolve('views/sign_in.html'));
});

module.exports = sign_in;