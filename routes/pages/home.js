const home = require('express').Router()
const path = require('path')

home.get('/', function(req, res) {
    res.sendFile(path.resolve('views/home_page.html'));
});

module.exports = home;