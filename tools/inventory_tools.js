var mysql_tools = require('./mysql_tools.js');
var qb_tools = require('./quickbooks_tools.js');

var exports = {}
exports.deductInventory = async function(item_id, deduct_quantity){
  try{
    var used_inventory = [];
    var select_sql = "SELECT * FROM inventory WHERE inventory.item_id=? ORDER BY date;";
    var select_values = [item_id];
    let item_inventory = await mysql_tools.runSQLQueryAsync(select_sql, select_values);
    let conn = await mysql_tools.getSQLConnectionAsync();
    await conn.beginTransaction();
    for (i=0; i<item_inventory.length; i++) {
      var inventory_quantity = item_inventory[i].remaining;
      var used_quantity = 0;
      if (inventory_quantity >= deduct_quantity){ //This bill has enough for the production
        var new_quantity = inventory_quantity - deduct_quantity;
        used_quantity = deduct_quantity;
        deduct_quantity = 0;
      } else { //This bill does not have enough to fulfill this production
        var new_quantity = 0;
        deduct_quantity -= inventory_quantity;
        used_quantity = inventory_quantity;
      }
      var to_add_inventory_info = item_inventory[i];
      to_add_inventory_info.quantity = used_quantity;
      used_inventory.push(to_add_inventory_info);
      
      var update_sql = "UPDATE inventory SET remaining=? WHERE inventory_id=? AND item_id=?;";
      var update_values = [new_quantity, item_inventory[i].inventory_id, item_inventory[i].item_id];
      var update_query = mysql_tools.format(update_sql, update_values);
      await conn.query(update_query);
      if(deduct_quantity == 0){
        await conn.commit();
        await conn.end();
        break;
      }
    }
    return used_inventory;
  } catch (err){
    console.log(err);
    conn.rollback();
  }
}

exports.resyncInventory = async function(date, item_id){
  try{
    var select_subtraction_log_sql = "SELECT * FROM subtraction_log WHERE date<'" + date + "' AND item_id=" + item_id + ";";
    let subtraction_log_result = await mysql_tools.runSQLQueryAsync(select_subtraction_log_sql);
    
  }catch(err){
    throw err;
  }
}

exports.calculateTotalCost = async function(batch_id){
  try{
    var select_sql = "SELECT SUM(inventory.cost*batch_inventory.quantity) as total_cost FROM batch INNER JOIN batch_inventory on batch.batch_id=batch_inventory.batch_id " + 
                      "INNER JOIN inventory ON batch_inventory.inventory_id=inventory.inventory_id WHERE batch.batch_id=" + batch_id+ ";"
    let result = await mysql_tools.runSQLQueryAsync(select_sql);
    return result[0].total_cost;
  } catch(err){
    throw err;
  }
}

exports.updateLastUpdatedTime = async function(){
  try{  
    var todays_date = new Date();
    var update_sql = "UPDATE config SET config_value = '" + todays_date.toISOString() + "' WHERE config_key = 'last_inventory_update';";
    await mysql_tools.runSQLQueryAsync(update_sql);
  } catch(err){
    console.log(err);
  }
}

exports.updateInventory = async function(){
  try{
    var select_sql = "SELECT * FROM config WHERE config_key = 'last_inventory_update';";
    let last_update_result = await mysql_tools.runSQLQueryAsync(select_sql);
    if(last_update_result.length <= 0){
      return;
    }
    var last_inventory_update = result[0].config_value;
    
    processNewBills(last_inventory_update);
    processUpdatedBills(last_inventory_update);
    processNewFinishedGoods(last_inventory_update);
    processUpdatedFinishedGoods(last_inventory_update);
    updateLastUpdatedTime();
  } catch(err){
    throw(err);
  }
}

exports.updateRawItem = async function(quantities){
  try{
    let refreshResponse = await qb_tools.refreshToken();
    await updateQBInventory(quantities);
  } catch(err){
    console.log(err);
  }
}

exports.updateQBInventory = async function (quantities, date){
  try{
    var length = quantities.length;
    for (ingredient in quantities){
      var quantity = quantities[ingredient];
      criteria = "where Name = '" + ingredient + "'";
      let item_list = await qb_tools.qbo.findItemsAsync(criteria);
      if (!item_list.QueryResponse.hasOwnProperty("Item")){
        return;
      }
      var returned_item = item_list.QueryResponse.Item[0];
      returned_item.QtyOnHand -= quantity;
      var todays_date = new Date();
      returned_item.InvStartDate = todays_date.toISOString().replace(/T.*/,'');
      qb_tools.qbo.updateItemAsync(returned_item);
    }
  } catch(err){
    console.log(err);
  }
}


module.exports = exports;
