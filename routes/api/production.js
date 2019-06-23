const production = require('express').Router()
const api_tools = require('../../util/api_tools')
const url = require('url');


production.get('/', async function (request, response) {
  try {
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    let result = await production.getBatches(query);
    api_tools.sendSuccessfulResponse(response, result);
  } catch (err) {
    console.log(err);
    response.writeHead(412, {
      'message': "Unable to get production"
    });
    response.end();
  }
});

production.post('/', async function (request, response) {
  let body = '';
  request.on('data', chunk => {
    body += chunk.toString();
  }).on('end', async () => {
    try {
      let result = await production.postProduction(body);
      api_tools.sendSuccessfulResponse(response, result);
    } catch (err) {
      console.log(err);
      response.writeHead(412, {
        'Content-Type': 'text/plain'
      });
      response.end(JSON.stringify(err));
    }
  });
});

production.get('/monthly', async function (request, response) {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;
  var finished_good = query.product;
  try {
    let result = await production.getMonthlyProduction(finished_good)
    api_tools.sendSuccessfulResponse(response, result);
  } catch (err) {
    response.writeHead(412, {
      'message': "Unable to get monthly production"
    });
    response.end();
  }
});

production.get('/batch', async function (request, response) {
  try {
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    var batch_id = query.batch_id;
    let result = await production.getBatchInfo(batch_id);
    api_tools.sendSuccessfulResponse(response, result);
  } catch (err) {
    console.log(err);
    response.writeHead(412, {
      'message': "Unable to update recipe for " + finished_good
    });
    response.end();
  }
});

module.exports = production;