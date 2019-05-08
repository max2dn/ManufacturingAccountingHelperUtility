var tools = require('../tools/tools.js')
var jwt = require('../tools/jwt.js')
var https = require('https')
var express = require('express')
var router = express.Router()
var url = require('url')
var qb_tools = require('../tools/quickbooks_tools.js')

/** /callback **/
router.get('/', function (req, res) {
  // Verify anti-forgery
  if(!tools.verifyAntiForgery(req.session, req.query.state)) {
    console.log("Error - INVALID")
    return res.send('Error - invalid anti-forgery CSRF response!')
  }
  // Exchange auth code for access token
  tools.intuitAuth.code.getToken(req.originalUrl).then(async function (token) {
    // Store token - this would be where tokens would need to be
    // persisted (in a SQL DB, for example).
    if(tools.containsAccountingScope()){
      let saveTokenResult = await tools.saveToken(token, req.query.realmId);
      req.session.realmId = req.query.realmId
      qb_tools.updateQBOFromCallback();
    }

    var errorFn = function(e) {
      console.log('Invalid JWT token!')
      console.log(e)
      res.redirect('/')
    }

    if(token.data.id_token) {
      try {
        // We should decode and validate the ID token
        jwt.validate(token.data.id_token, function() {
          // Callback function - redirect to /connected
          req.session.user = "maxenchung"
          res.redirect('/homepage')
        }, errorFn)
      } catch (e) {
        errorFn(e)
      }
    } else {
      // Redirect to /connected
      res.redirect('/successful_connection')
    }
  }, function (err) {
    console.log(err)
    res.send(err)
  })
})

module.exports = router
