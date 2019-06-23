const actions = require('express').Router()
const sync = require('./sync')

actions.use('sync', sync)

module.exports = actions;