const api = require('express').Router();
const inventory = require('./inventory');
const items = require('./items');
const production = require('./production');
const recipe = require('./recipe');
const settings = require('./settings');

api.use('/inventory', inventory);
api.use('/items', items);
api.use('/production', production);
api.use('/recipe', recipe);
api.use('/settings', settings);

module.exports = api;