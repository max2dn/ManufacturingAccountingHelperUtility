const recipe_router = require('express').Router()
const recipe_controller = require('../../controllers/recipe')
const api_tools = require('../../util/api_tools')
const url = require('url');


recipe_router.get('/', async function (request, response) {
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    var finished_good = query.product;
    try{
      let result = await recipe_controller.getRecipe(finished_good);
      api_tools.sendSuccessfulResponse(response, result);
    } catch(err){
      console.log(err);
      response.writeHead(412, {'message': "Unable to get ingredients for " + finished_good});
      response.end();
    }
});

recipe_router.put('/', async function (request, response){
  let body = '';
  request.on('data', chunk => {
    body += chunk.toString();
  }).on('end', async () => {
    try{
      let result = await recipe_controller.updateRecipe(body);
      api_tools.sendSuccessfulResponse(response, result);
    } catch(err){
      console.log(err);
      response.writeHead(412, {'message': "Unable to update recipe for " + finished_good});
      response.end();
    }
  });
});

recipe_router.delete('/', async function (request, response) {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;
  var finished_good = query.product;
  try{
    let result = await recipe_controller.getRecipe(finished_good);
    api_tools.sendSuccessfulResponse(response, result);
  } catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to delete recipe for " + finished_good});
    response.end();
  }
});

module.exports = recipe_router;