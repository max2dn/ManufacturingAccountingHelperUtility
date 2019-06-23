const app = require('express')()
const routes = require('./routes')
const https = require('https');
const fs = require('fs');
const port = 3000

app.set('port', port);
app.use('/', routes)

app.get('/logout', function(req, res){
    req.session.destroy(function(err){
        res.clearCookie('user_sid');
        res.redirect('/sign_in')
    });
});

app.get('*', function (req, res, next) {
    res.status(404).send("404: Sorry can't find that!")
});

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
    }, app).listen(app.get('port'), function () {
    console.log('Starting Server on Port ' + port)
});