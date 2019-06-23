const redirect = require('express').Router()
const callback = require('./callback')
const connect_to_quickbooks = require('./connect_to_quickbooks')
const sign_in_with_intuit = require('./sign_in_with_intuit')

redirect.use('/callback', callback)
redirect.use('/connect_to_quickbooks', connect_to_quickbooks)
redirect.use('./sign_in_with_intuit', sign_in_with_intuit)

module.exports = redirect;