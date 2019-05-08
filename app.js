'use strict'
var configs = require('./tools/config_file_loader.js').config;
var https = require('https');
var url = require('url');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var express = require('express');
var app = express();
var path = require('path')
var fs = require('fs');
var recipe = require('./tools/recipe.js')
var production = require ('./tools/production.js')
var config = require('./tools/config.js')
var sync = require('./tools/sync.js')
var db_getters = require('./tools/database_getters.js')
var tools = require('./tools/tools.js')
//var multer = require('multer');
//var upload = multer({ dest: './uploads/' });

var port = configs.port;

tools.refreshEndpoints();

var checkSession = (req, res, next) => {
 /*
  if (req.session.user && req.cookies.user_sid) {
    next();
  } else {
    res.redirect("/sign_in")
  }
  sync.syncInventory(function(){});
  */
  next();
}

// Generic Express config
app.set('port', port);
app.set('views', 'views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    key: 'user_sid',
    secret: 'aoieFaoOIKOsoieaksosenFASTaeion1',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use("/styles",  express.static(__dirname + '/public/styling'));
app.use("/scripts", express.static(__dirname + '/public/scripts'));
app.use("/images",  express.static(__dirname + '/public/images'));
app.use("/modules", express.static(__dirname + '/public/HTML'))

app.get('/', checkSession, function(req, res) {
  res.sendFile(__dirname + '/views/home_page.html');
});

app.get('/sign_in', function(req, res) {
  res.sendFile(__dirname + '/views/sign_in.html');
});

app.get('/logout', function(req, res){
  req.session.destroy(function(err){
    res.clearCookie('user_sid');
    res.redirect('/sign_in')
  });
});

app.get('/successful_connection', function(req, res) {
  res.sendFile(__dirname + '/views/successful_connection.html');
});


app.get('/homepage', checkSession, function(req, res) {
  res.sendFile(__dirname + '/views/home_page.html');
});

app.get('/productionpage', checkSession, function(req, res) {
  res.sendFile(__dirname + '/views/production.html');
});

app.get('/recipepage', checkSession, function(req, res) {
  res.sendFile(__dirname + '/views/recipe.html');
});

app.get('/settingspage', checkSession, function(req, res) {
  res.sendFile(__dirname + '/views/settings.html');
});

app.get('/generalexcisepage', checkSession, function(req, res) {
  res.sendFile(__dirname + '/views/general_excise.html');
});


app.use('/connect_to_quickbooks', require('./routes/connect_to_quickbooks.js'))
app.use('/sign_in_with_intuit',  require('./routes/sign_in_with_intuit.js'))

// Callback - called via redirect_uri after authorization
app.use('/callback', require('./routes/callback.js'))

app.use('/connected', require('./routes/connected.js'))

app.get('/initialsync', async function(request, response){
  try{
    await sync.initialItemSync();
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end();
  } catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to perform initial sync"});
    response.end();
  }
});

function sendSuccessfulResponse(response, result) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end(JSON.stringify(result));
}

app.get('/ingredients', async function (request, response) {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;
  var finished_good = query.finishedgood;
  try{
    let result = await recipe.getIngredients(finished_good);
    sendSuccessfulResponse(response, result);
  } catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to get ingredients for " + finished_good});
    response.end();
  }
});

app.get('/nonconfigureditems', async function (request, response) {
  try{
    let result = await recipe.getNonConfiguredItems();
    sendSuccessfulResponse(response, result);
  } catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to get unconfigured items"});
    response.end();
  }
});

app.get('/recipe', async function (request, response) {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;
  var finished_good = query.product;
  try{
    let result = await recipe.getRecipe(finished_good);
    sendSuccessfulResponse(response, result);
  } catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to get recipe for " + finished_good});
    response.end();
  }
});

app.get('/production', async function (request, response) {
  try{
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    let result = await production.getBatches(query);
    sendSuccessfulResponse(response, result);
  } catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to get production"});
    response.end();
  }
});

app.get('/finishedgoods', async function (request, response) {
  try{
    let result = await recipe.getProducts();
    sendSuccessfulResponse(response, result);
  } catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to get finished goods"});
    response.end();
  }
});

async function respondToInventoryRequest(request, response, type){
  try{
    let result = await db_getters.getInventory(type);
    sendSuccessfulResponse(response, result);
  } catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to get " + type + " inventory"});
    response.end();
  }
}

app.get('/rawinventory', async function(request,response){
  await respondToInventoryRequest(request, response, "raw");
});

app.get('/suppliesinventory', async function (request, response) {
  await respondToInventoryRequest(request, response, "supplies");
});

app.get('/finishedinventory', async function (request, response) {
  await respondToInventoryRequest(request, response, "finished_good");
});

app.get('/rawitems', async function (request, response) {
  try{
    let result = await recipe.getRawItems();
    sendSuccessfulResponse(response, result);
  } catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to get " + type + " inventory"});
    response.end();
  }
});

app.get('/monthlyproduction', async function(request, response) {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;
  var finished_good = query.product;
  try{
    let result = await production.getMonthlyProduction(finished_good)
    sendSuccessfulResponse(response, result);
  } catch(err){
    response.writeHead(412, {'message': "Unable to get monthly production"});
    response.end();
  }
});

app.get('/syncInventory', function(request, response) {
  sync.syncInventory(function(err, result) {
    sendSuccessfulResponse(response, result);
  });
});

app.get('/config', async function(request, response){
  try{
    let result = await config.getConfigs();
    sendSuccessfulResponse(response, result);
  } catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to get " + type + " inventory"});
    response.end();
  }
});

app.get('/batchinfo', async function(request, response){
  try{
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    var batch_id = query.batch_id;
    let result = await production.getBatchInfo(batch_id);
    sendSuccessfulResponse(response, result);
  } catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to update recipe for " + finished_good});
    response.end();
  }
});

app.post('/production', async function (request, response) {
  let body = '';
  request.on('data', chunk => {
    body += chunk.toString();
  }).on('end', async () => {
    try {
      let result = await production.postProduction(body);
      sendSuccessfulResponse(response, result);
    } catch(err){
      console.log(err);
      response.writeHead(412, {'Content-Type': 'text/plain'});
      response.end(JSON.stringify(err));
    }
  });
});

app.post('/recipe', function (request, response) {
  let body = '';
  request.on('data', chunk => {
    body += chunk.toString();
  }).on('end', async () => {
    try{
      let result = await recipe.postRecipe(body);
      sendSuccessfulResponse(response, result);
    } catch(err){
      response.writeHead(412, {'message': "Unable to add recipe for " + finished_good});
      response.end();
    }
  });
});

/*
app.post('/generalexcise', upload.single('myFile'), function(request, response) {
  if (request.file) {
      var filename = req.file.filename;
      var uploadStatus = 'File Uploaded Successfully';
  } else {
      var filename = 'FILE NOT UPLOADED';
      var uploadStatus = 'File Upload Failed';
  }
    
  res.render('index.hbs', { status: uploadStatus, filename: `Name Of File: ${filename}` });
});
*/

app.put('/recipe', async function (request, response){
  let body = '';
  request.on('data', chunk => {
    body += chunk.toString();
  }).on('end', async () => {
    try{
      let result = await recipe.updateRecipe(body);
      sendSuccessfulResponse(response, result);
    } catch(err){
      console.log(err);
      response.writeHead(412, {'message': "Unable to update recipe for " + finished_good});
      response.end();
    }
  });
});

app.put('/config', async function (request, response){
  try{
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;
    if(Object.keys(query)[0] == "inhouse_vendor"){
      let result = await sync.putInHouseVendor(query[Object.keys(query)[0]]);
      sendSuccessfulResponse(response, result);
    }
    else if(Object.keys(query)[0].includes("account")){
      var account_name = query[Object.keys(query)[0]];
      var account = Object.keys(query)[0];
      let result = await sync.putAccount(account, account_name);
      sendSuccessfulResponse(response, result);
    }
    else{
      let result = await sync.putConfig(query);
      sendSuccessfulResponse(response, result);
    }
  } catch(err){
    console.log(err);
    response.statusMessage = err.message;
    response.status(400).end();
  }
});

app.delete('/recipe', async function (request, response) {
  var url_parts = url.parse(request.url, true);
  var query = url_parts.query;
  var finished_good = query.product;
  try{
    let result = await recipe.getRecipe(finished_good);
    sendSuccessfulResponse(response, result);
  } catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to delete recipe for " + finished_good});
    response.end();
  }
});

app.get('/invoice', async function (request, response){
  try{
    await sync.updateInvoice();
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end();
  }catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to get invoice"});
    response.end();
  }
});

app.get('/sales_receipts', async function (request, response){
  try{
    await sync.updateSalesReceipts();
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end();
  }catch(err){
    console.log(err);
    response.writeHead(412, {'message': "Unable to update sales receipts"});
    response.end();
  }
});

app.get('*', function (req, res, next) {
  res.status(404).send("404: Sorry can't find that!")
});


https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(app.get('port'), function () {
  console.log('Starting Server on Port ' + port)
})
