var qb_tools = require('../util/quickbooks_tools');
var mysql_tools = require('../util/mysql_tools');
var configs = require('../util/config');
var settings = require('./settings');
var items = require('./items');

var exports = {};

exports.initialItemSync = async function(){
  try{
    await items.initialItemSync();
  } catch(err){
    throw err
  }
}

exports.syncInventory = async function(){
  try{
    let result = await qb_tools.updateInventory();
  } catch(err){
    throw err;
  }
}

exports.putInHouseVendor = async function(inhouse_vendor_name){
  try{
    let inhouse_vendor_id = await settings.getInHouseVendor(inhouse_vendor_name);
    var update_sql = "UPDATE config SET config_value=?, config_id=? WHERE config_key=?;"
    var update_values = [inhouse_vendor_name, inhouse_vendor_id, "inhouse_vendor"];
    let result = mysql_tools.runSQLQueryAsync(update_sql, update_values);
    configs.updateInMemoryConfigs();
    return result;
  } catch(err){
    throw err;
  }
}

exports.putAccount = async function(account, account_name){
  try{
    let account_id = await settings.getAccountByName(account_name);
    var update_sql = "UPDATE config SET config_value=?, config_id=? WHERE config_key=?;";
    var update_values = [account_name, account_id, account];
    let result = await mysql_tools.runSQLQueryAsync(update_sql, update_values);
    configs.updateInMemoryConfigs();
    return result;
  } catch(err){
    throw err;
  }
}

exports.putConfig = async function(query){
  try {
    var update_sql = "UPDATE config SET config_value=? WHERE config_key=?;";
    var update_values = [query[Object.keys(query)[0]], Object.keys(query)[0]];
    let result = await mysql_tools.runSQLQueryAsync(update_sql, update_values);
    configs.updateInMemoryConfigs();
    return result;
  } catch (err) {
    console.log(err);
  }
}


module.exports = exports;
