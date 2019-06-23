const general_excise = require('express').Router()
const path = require('path')

general_excise.get('/', function(req, res) {
    res.sendFile(path.resolve('views/general_excise.html'));
});

module.exports = general_excise;