const settings = require('express').Router()
const api_tools = require('../../util/api_tools')
const url = require('url');


settings.get('/', async function (request, response) {
  try {
    let result = await config.getConfigs();
    api_tools.sendSuccessfulResponse(response, result);
  } catch (err) {
    console.log(err);
    response.writeHead(412, {
      'message': "Unable to get " + type + " inventory"
    });
    response.end();
  }
});

settings.put('/', async function (request, response) {
  try {
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    if (Object.keys(query)[0] == "inhouse_vendor") {
      let result = await sync.putInHouseVendor(query[Object.keys(query)[0]]);
      api_tools.sendSuccessfulResponse(response, result);
    } else if (Object.keys(query)[0].includes("account")) {
      var account_name = query[Object.keys(query)[0]];
      var account = Object.keys(query)[0];
      let result = await sync.putAccount(account, account_name);
      api_tools.sendSuccessfulResponse(response, result);
    } else {
      let result = await sync.putConfig(query);
      api_tools.sendSuccessfulResponse(response, result);
    }
  } catch (err) {
    console.log(err);
    response.statusMessage = err.message;
    response.status(400).end();
  }
});

module.exports = settings;