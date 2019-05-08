if(process.argv[2]){
    var configs = require("../config/" + process.argv[2]);
} else {
    var configs = require('../config/config.json')
}

var exports = {};

exports.config = configs;

module.exports = exports;