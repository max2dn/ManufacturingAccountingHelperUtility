const pages = require('express').Router();
const production = require('./production');
const home = require('./home');
const general_excise = require('./general_excise');
const recipe = require('./recipe');
const settings = require('./settings');
const sign_in = require('./sign_in');

pages.use('/production', production);
pages.use('/home', home);
pages.use('/generalexcise', general_excise);
pages.use('/recipe', recipe);
pages.use('/settings', settings);
pages.use('/signin', sign_in)

module.exports = pages;