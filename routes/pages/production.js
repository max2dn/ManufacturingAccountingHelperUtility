const production = require('express').Router()
const path = require('path')

production.get('/', function(req, res) {
    res.sendFile(path.resolve('views/production.html'));
});

module.exports = production;