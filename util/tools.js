var Tokens = require('csrf');
var csrf = new Tokens();
var ClientOAuth2 = require('client-oauth2');
var request = require('request');
var config = require('./config_file_loader.js').config;
var mysql_tools = require('./mysql_tools.js');

var authConfig = {
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  redirectUri: config.url + "/callback"
}

var exports = {};

exports.basicAuth = require('btoa')(authConfig.clientId + ':' + authConfig.clientSecret);

// Use a local copy for startup.  This will be updated in refreshEndpoints() to call:
// https://developer.api.intuit.com/.well-known/openid_configuration/
exports.openid_configuration = require('../config/openid_configuration.json')

// Should be called at app start & scheduled to run once a day
// Get the latest OAuth/OpenID endpoints from Intuit
exports.refreshEndpoints = function() {
  request({
    // Change this to Sandbox or non-sandbox in `config.json`
    // Non-sandbox: https://developer.api.intuit.com/.well-known/openid_configuration/
    // Sandbox: https://developer.api.intuit.com/.well-known/openid_sandbox_configuration/
    url: config.configurationEndpoint,
    headers: {
      'Accept': 'application/json'
    }

  }, function(err, response) {
    if(err) {
      console.log(err)
      return err
    }

    // Update endpoints
    var json = JSON.parse(response.body)
    this.openid_configuration = json
    this.openid_uri = json.userinfo_endpoint
    this.revoke_uri = json.revocation_endpoint

    // Re-create OAuth2 Client
    authConfig.authorizationUri = json.authorization_endpoint
    authConfig.accessTokenUri = json.token_endpoint
    this.intuitAuth = new ClientOAuth2(authConfig);
  })
}

  // Should be used to check for 401 response when making an API call.  If a 401
  // response is received, refresh tokens should be used to get a new access token,
  // and the API call should be tried again.
exports.checkForUnauthorized = function(req, requestObj, err, response) {
  return new Promise(function (resolve, reject) {
    if(response.statusCode == 401) {
      console.log('Received a 401 response!  Trying to refresh tokens.')

      // Refresh the tokens
      this.refreshTokens(function(err, newToken){
        if(err)
          reject(err);
        // Try API call again, with new accessToken
        requestObj.headers.Authorization = 'Bearer ' + newToken.accessToken
        console.log('Trying again, making API call to: ' + requestObj.url)
        request(requestObj, function (err, response) {
          // Logic (including error checking) should be continued with new
          // err/response objects.
          resolve({err, response})
        })
      });
    } else {
      // No 401, continue!
      resolve({err, response})
    }
  })
}

exports.setScopes = function(flowName) {
  authConfig.scopes = config.scopes[flowName];
  this.intuitAuth = new ClientOAuth2(authConfig);
}

exports.containsOpenId = function() {
  if(!authConfig.scopes) return false;
  return authConfig.scopes.includes('openid')
}

exports.containsAccountingScope = function() {
  if(!authConfig.scopes) return false;
  return authConfig.scopes.includes('com.intuit.quickbooks.accounting')
}

// Setup OAuth2 Client with values from config.json
exports.intuitAuth = new ClientOAuth2(authConfig);

// Get anti-forgery token to use for state
exports.generateAntiForgery = function(session) {
  session.secret = csrf.secretSync()
  return csrf.create(session.secret)
}

exports.verifyAntiForgery = function(session, token) {
  return csrf.verify(session.secret, token)
}

exports.saveToken = async function(token, realmId) {
  var user_id = 1;
  var insert_sql = "UPDATE user SET access_token='" + token.accessToken + "', " +
                    "refresh_token='" + token.refreshToken + "', " +
                    "token_type='" + token.tokenType + "', " +
                    "data='" + JSON.stringify(token.data) + "', " +
                    "realm_id='" + realmId + "' " +
                    "WHERE user_id=" + user_id + ";";
  let result = mysql_tools.runSQLQueryAsync(insert_sql);
  return result;
}

exports.getToken = async function() {
  try{
    var user_id = 1;
    var select_sql = "SELECT * FROM user WHERE user_id=" + user_id;
    let result = await mysql_tools.runSQLQueryAsync(select_sql);
    if (typeof result === 'undefined'){
      return null;
    }
    if(result.length <= 0){
      console.log("Cannot find data for user_id" + user_id);
      return null;
    }
    var user_data = result[0];
    if(user_data.access_token == ""){
      return null;
    }
    this.refreshEndpoints();
    return this.intuitAuth.createToken(
      user_data.access_token, user_data.refresh_token,
      user_data.token_type, JSON.parse(user_data.data));
  } catch(err){
    throw err;
  }
}

module.exports = exports;
