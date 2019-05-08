
var tools = require('./tools.js');
var configs = require('./config.js');
var Promise = require('bluebird');
var QuickBooks = require('node-quickbooks');

QuickBooks.setOauthVersion('2.0');

Promise.promisifyAll(QuickBooks.prototype);

var exports = {};

exports.init = async function(){
  try{
    let token = await tools.getToken();
    accessToken = token;
    if(accessToken){
      this.qbo = new QuickBooks(configs.client_id,
                          configs.client_secret,
                          accessToken.accessToken, /* oAuth access token */
                          false, /* no token secret for oAuth 2.0 */
                          configs.realm_id,
                          true, /* use a sandbox account */
                          false, /* turn debugging on */
                          28, /* minor version */
                          '2.0', /* oauth version */
                          accessToken.refreshToken /* refresh token */);
    }
    else {
      console.log("Must Connect to QuickBooks")
    }
  } catch(err){
    console.log(err);
    exit(1);
  }
}

exports.refreshToken = async function(){
  let refreshResponse = await this.qbo.refreshAccessTokenAsync();
  var new_token = {};
  new_token.accessToken = refreshResponse.access_token;
  new_token.refreshToken = refreshResponse.refresh_token;
  new_token.tokenType = refreshResponse.token_type;
  new_token.data = refreshResponse;
  let saveTokenResponse = await tools.saveToken(new_token, configs.realm_id);
  return saveTokenResponse;
}


exports.updateQBOFromCallback = async function(){
  this.init();
}

exports.init();

module.exports = exports;