var mysql_tools = require('../util/mysql_tools.js');
var configs = require('../util/config_file_loader.js').config;
var qb_tools = require('../util/quickbooks_tools.js');
var items = require('./items.js');

var exports = {};

exports.addBillExpenseLine = async function(bill, line, object_type){
  try{
    if('AccountBasedExpenseLineDetail' in line){
      return;
    }
    var date = bill.MetaData.CreateTime.replace(/T.*/,'');
    var item_info = line.ItemBasedExpenseLineDetail;
    let item = await qb_tools.qbo.getItemAsync(item_info.ItemRef.value);
    if(item.AssetAccountRef.value != configs.raw_item_asset_account && item.AssetAccountRef.value != configs.supplies_asset_account){
      return;
    }
    if(await db_getters.itemExists(item_info.ItemRef.value) == false){
      await items.addRawItem(item_info);
    }
    var insert_sql = "INSERT into inventory (item_id, object_type, object_id, date, quantity, remaining, cost) VALUES (?,?,?,?,?,?,?);";
    var insert_values = [item_info.ItemRef.value, object_type, bill.Id, date, item_info.Qty, item_info.Qty, item_info.UnitPrice];
    return mysql_tools.runSQLQueryAsync(insert_sql, insert_values);
  } catch(err){
    console.log(err);
  }
}

exports.updateBillExpenseLine = async function(bill, line, object_type){
  try{
    if('AccountBasedExpenseLineDetail' in line){
    return;
    }
    var date = bill.MetaData.CreateTime.replace(/T.*/,'');
    var item_info = line.ItemBasedExpenseLineDetail;
    let item = await qb_tools.qbo.getItemAsync(item_info.ItemRef.value);
    if(item.AssetAccountRef.value != configs.raw_item_asset_account && item.AssetAccountRef.value != configs.supplies_asset_account){
    return;
    }
    if(await db_getters.itemExists(item_info.ItemRef.value) == false){
    return;
    }
    var select_old_sql = "SELECT * FROM inventory WHERE object_id=?AND item_id=? AND object_type=?;"
    var select_old_values = [bill.Id, item_info.ItemRef.value, object_type];
    let select_old_result = await mysql_tools.runSQLQueryAsync(select_old_sql, select_old_values);
    var new_remaining = item_info.Qty - select_old_result[0].quantity + select_old_result[0].remaining;
    var update_bill_sql = "UPDATE inventory SET date=?, quantity=?, remaining=?, cost=? " +
                          "WHERE object_id=? AND item_id=?;"
    var update_bill_values = [date, item_info.Qty, new_remaining, item_info.UnitPrice, bill.Id, item_info.ItemRef.value];
    await mysql_tools.runSQLQueryAsync(update_bill_sql, update_bill_values);
  } catch(err) {
    console.log(err);
  } 
}
  
exports.processNewBills = async function(last_inventory_update){
  try{
    var querySQL = "WHERE VendorRef != '" + configs.inhouse_vendor_id + "' AND MetaData.CreateTime >= '" + last_inventory_update + "'";
    let response = await qb_tools.qbo.findBillsAsync(querySQL);
    var bill_responses = [];
    for(i in response.QueryResponse.Bill){
      var bill = response.QueryResponse.Bill[i];
      for(line in bill.Line){
        var line = bill.Line[line];
        bill_responses.push(addBillExpenseLine(bill, line));
      }
    }
    return bill_responses;
  } catch(err){
      console.log(err);
  }
}
  
exports.processUpdatedBills = async function(last_inventory_update){
  try{
    var querySQL = "WHERE VendorRef != '" + configs.inhouse_vendor_id + "' AND MetaData.LastUpdatedTime >= '" + last_inventory_update + "'"
    let response = await qb_tools.qbo.findBillsAsync(querySQL);
    var bill_responses = [];
    for(i in response.QueryResponse.Bill){
      var bill = response.QueryResponse.Bill[i];
      if(bill.MetaData.LastUpdatedTime == bill.MetaData.CreateTime){
        continue;
      }
      for(line in bill.Line){
        var line = bill.Line[line];
        bill_responses.push(updateBillExpenseLine(bill, line));
      }
    }
    return bill_responses;
  } catch(err){
    console.log(err);
  }
}
  
exports.processNewExpenses = async function(last_inventory_update){
  var querySQL = "WHERE VendorRef != '" + configs.inhouse_vendor_id + "' AND MetaData.CreateTime >= '" + last_inventory_update + "'";
  try{
    var expense_responses = []
    let response = await qb_tools.qbo.findExpenseAsync(querySQL);
    for(i in response.QueryResponse.Expense){
      var expense = response.QueryResponse.Expense[i];
      for(line in expense.Line){
        var line = expense.Line[line];
        expense_responses.push(addBillLine(expense, line));
      }
    }
    return expense_responses;
  } catch(err){
    console.log(err);
  }
}

exports.processUpdatedExpenses = async function(last_inventory_update){
  
}

module.exports = exports;