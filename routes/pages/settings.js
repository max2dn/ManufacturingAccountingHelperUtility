const settings = require('express').Router()
const path = require('path')

settings.get('/', function(req, res) {
    res.sendFile(path.resolve('views/settings.html'));
});

module.exports = settings;