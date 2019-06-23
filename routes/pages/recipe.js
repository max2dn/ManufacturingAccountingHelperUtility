const recipe = require('express').Router()
const path = require('path')

recipe.get('/', function(req, res) {
    res.sendFile(path.resolve('views/recipe.html'));
});

module.exports = recipe;