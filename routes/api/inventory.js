const inventory = require('express').Router()
const api_tools = require('../../util/api_tools')
const db_getters = require('../../model/database_getters')

async function respondToInventoryRequest(request, response, type) {
  try {
    let result = await db_getters.getInventory(type);
    api_tools.sendSuccessfulResponse(response, result);
  } catch (err) {
    console.log(err);
    response.writeHead(412, {
      'message': "Unable to get " + type + " inventory"
    });
    response.end();
  }
}

inventory.get('/raw', async function (request, response) {
  await respondToInventoryRequest(request, response, "raw");
});

inventory.get('/supplies', async function (request, response) {
  await respondToInventoryRequest(request, response, "supplies");
});

inventory.get('/finishedgoods', async function (request, response) {
  await respondToInventoryRequest(request, response, "finished_good");
});

module.exports = inventory