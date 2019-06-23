exports = {};

exports.sendSuccessfulResponse = function(response, result) {
    response.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    response.end(JSON.stringify(result));
}

module.exports = exports;