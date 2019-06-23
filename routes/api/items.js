const items = require('express').Router();
const api_tools = require('../../util/api_tools')
const recipe = require('../../controllers/recipe')

items.get('/nonconfigured', async function (request, response) {
  try {
    let result = await recipe.getNonConfiguredItems();
    api_tools.sendSuccessfulResponse(response, result);
  } catch (err) {
    console.log(err);
    response.writeHead(412, {
      'message': "Unable to get unconfigured items"
    });
    response.end();
  }
});

items.get('/finishedgoods', async function (request, response) {
  try {
    let result = await recipe.getProducts();
    api_tools.sendSuccessfulResponse(response, result);
  } catch (err) {
    console.log(err);
    response.writeHead(412, {
      'message': "Unable to get finished goods"
    });
    response.end();
  }
});

items.get('/raw', async function (request, response) {
  try {
    let result = await recipe.getRawItems();
    api_tools.sendSuccessfulResponse(response, result);
  } catch (err) {
    console.log(err);
    response.writeHead(412, {
      'message': "Unable to get " + type + " inventory"
    });
    response.end();
  }
});

module.exports = items;