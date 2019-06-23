var mysql_tools = require('../util/mysql_tools.js');
var configs = require('../util/config_file_loader.js').config;
var inventory_tools = require('../util/inventory_tools.js');
var qb_tools = require('../util/quickbooks_tools.js')

var exports = {};

exports.addRawItem = async function(item){
  try{
    if(!item.hasOwnProperty("AssetAccountRef")){
      return;
    }
    var account = item.AssetAccountRef.value;
    if(account == configs.raw_item_asset_account){
      var item_type = "raw";
    }
    else if(account == configs.supplies_asset_account){
      var item_type = "supplies";
    }
    else{
      return;
    }
    var insert_sql = "INSERT into item(item_id, item_name, uom, type) VALUES (?, ?, ?, ?);"
    var insert_values = [item.Id, item.Name, item.Description, item_type];
    await mysql_tools.runSQLQueryAsync(insert_sql, insert_values);
  } catch(err){
    throw err;
  }
}

exports.addFinishedGoodsItem = async function (item){
  try{
    if(!item.hasOwnProperty("AssetAccountRef")){
      return false;
    }
    if(item.AssetAccountRef.value != configs.fg_asset_account)
      return false;
    var insert_sql = "INSERT into item(item_id, item_name, uom, type, active) VALUES (?, ?, ?, ?, ?);";
    var insert_values = [item.Id, item.Name, item.Description, 'finished_good', 1];
    await mysql_tools.runSQLQueryAsync(insert_sql, insert_values);
    return true;
  } catch(err){
    console.log(err);
    return false;
  }
}

exports.getItemType = async function (item_id){
  try{
    let item = await qb_tools.qbo.getItemAsync(item_id);
    switch (parseInt(item.AssetAccountRef.value)) {
      case configs.raw_item_asset_account:
        return "raw";
      case configs.supplies_asset_account:
        return "supplies";
      case configs.fg_asset_account:
        return "finished_good"
      default:
        return "none"
    }
  } catch(err){
    return null;
  }
}

exports.processNewFinishedGoods = async function(last_inventory_update){
  var querySQL = "WHERE MetaData.CreateTime >= '" + last_inventory_update + "'";
  try{
    let response = await qb_tools.qbo.findItemsAsync(querySQL);
    for(i in response.QueryResponse.Item){
      var item = response.QueryResponse.Item[i];
      self.addFinishedGoodsItem(item);
    }
  } catch(err){
    console.log(err);
  }
}
  
exports.processUpdatedFinishedGoods = async function(last_inventory_update){
  var querySQL = "WHERE MetaData.LastUpdatedTime >= '" + last_inventory_update + "'"
  let response = qb_tools.qbo.findItemsAsync(querySQL);
  var mysql_responses = []
  for(i in response.QueryResponse.Item){
    var item = response.QueryResponse.Item[i];
    if(!item.hasOwnProperty("AssetAccountRef")){
      continue;
    }
    if(item.AssetAccountRef.value != configs.fg_asset_account)
      continue;
    var update_sql = "UPDATE item SET item_name=?, uom=? WHERE item_id=?;";
    var update_values = [item.Name, item.Description, item.Id];
    mysql_responses.push(mysql_tools.runSQLQueryAsync(update_sql, update_values));
  }
  return mysql_responses;
}

exports.initialItemSync = async function(){
try{
    await qb_tools.refreshToken();
    let item_list = await qb_tools.qbo.findItemsAsync();
    if (!item_list.QueryResponse.hasOwnProperty("Item")){
      return;
    }
    for(i in item_list.QueryResponse.Item){
      var item = item_list.QueryResponse.Item[i];
      let item_type = await self.getItemType(item.Id);
      console.log(item);
      switch (item_type) {
        case "raw":
        case "supplies":
          self.addRawItem(item);
          break;
        case "finished_good":
          self.addFinishedGoodsItem(item);
          break;
        default:
          break;
      }
    }
  } catch(err){
    throw err;
  }
}

module.exports = exports;