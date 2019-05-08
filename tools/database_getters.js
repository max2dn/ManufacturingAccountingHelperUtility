var mysql_tools = require('./mysql_tools.js')

var exports = {};

exports.getItemId = async function(item_name){
  try{
    var item_select_sql = "SELECT item_id FROM item WHERE item_name='" + item_name + "';";
    let item_result = await mysql_tools.runSQLQueryAsync(item_select_sql);
    if(item_result.length > 0)
      return item_result[0].item_id;
    else
      return -1;
  } catch(err){
    console.log(err);
  }
}

exports.getItem = async function(item_name){
  try{
    var item_select_sql = "SELECT * FROM item WHERE item_name='" + item_name + "';";
    return mysql_tools.runSQLQueryAsync(item_select_sql);
  } catch(err){
    console.log(err);
  }
}

exports.getInventory = async function(type){
  try{
    var select_sql = "SELECT t1.item_name AS product, t1.cost, t2.quantity FROM " +
                      "(SELECT inventory.item_id AS item_id, item_name, cost, type " +
                      "FROM inventory, item, (SELECT MAX(inventory_id) AS id, item_id FROM inventory GROUP BY item_id) AS t3 " +
                      "WHERE inventory.item_id=item.item_id AND t3.id=inventory.inventory_id AND t3.item_id=inventory.item_id " +
                      "AND inventory_id IN " +
                        "(SELECT MAX(inventory_id) FROM inventory GROUP BY item_id)) t1, " +
                      "(SELECT item_id, SUM(remaining) AS quantity " +
                      "FROM inventory GROUP BY item_id) t2 " +
                      "WHERE t2.item_id=t1.item_id AND t1.type='" + type + "' ORDER BY t1.item_name;"
    return mysql_tools.runSQLQueryAsync(select_sql);
  } catch(err){
    console.log(err);
  }
}

exports.itemExists = async function(item_id){
  try{
    var select_item_sql = "SELECT * FROM item WHERE item_id = ?" + item_id + "";
    let select_item_result = await mysql_tools.runSQLQueryAsync(select_item_sql);
    if(select_item_result.length == 0){
      return false;
    }
    return true;
  } catch(err){
    console.log(err);
  }
}

module.exports = exports;
