const routes = require('express').Router()
const api = require('./api')
const pages = require('./pages')
const public = require('./public')
const redirect = require('./redirect')
const path = require('path');

routes.get('/', (req, res) => {
    res.sendFile(path.resolve('views/home_page.html'));
});

routes.use('/api', api);
routes.use('/pages', pages);
routes.use('/public', public);
routes.use('/redirect', redirect);


module.exports = routes;
