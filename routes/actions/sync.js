const sync = require('express').Router()
const api_tools = require('../../util/api_tools')

sync.get('/inventory', function (request, response) {
    sync.syncInventory(function (err, result) {
        api_tools.sendSuccessfulResponse(response, result);
    });
});

sync.get('/invoice', async function (request, response) {
    try {
        await sync.updateInvoice();
        response.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        response.end();
    } catch (err) {
        console.log(err);
        response.writeHead(412, {
            'message': "Unable to get invoice"
        });
        response.end();
    }
});

sync.get('/sales_receipts', async function (request, response) {
    try {
        await sync.updateSalesReceipts();
        response.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        response.end();
    } catch (err) {
        console.log(err);
        response.writeHead(412, {
            'message': "Unable to update sales receipts"
        });
        response.end();
    }
});

sync.get('/initial', async function (request, response) {
    try {
        await sync.initialItemSync();
        response.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        response.end();
    } catch (err) {
        console.log(err);
        response.writeHead(412, {
            'message': "Unable to perform initial sync"
        });
        response.end();
    }
});

module.exports = sync;