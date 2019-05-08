var promise_mysql = require('promise-mysql')
var util = require('util');
var config = require('./config_file_loader.js').config;

var exports = {};

exports.getSQLConnectionAsync = async function(){
  return promise_mysql.createConnection(config.mysql_info);
}

exports.format = function(sql, values){
  return promise_mysql.format(sql,values);
}

exports.runSQLQueryAsync = async function(sql, values=[]) {
  if(values.length > 0){
    sql = promise_mysql.format(sql,values);
  }
  try{
    let conn = await this.getSQLConnectionAsync();
    let result = await conn.query(sql);
    conn.end();
    return result;
  } catch(err){
    console.log(err);
  }
}

module.exports = exports;

