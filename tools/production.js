var qb_tools = require('./quickbooks_tools.js')
var inventory_tools = require('./inventory_tools.js')
var mysql_tools = require('./mysql_tools.js')
var db_getters = require('./database_getters.js')

async function checkTotalInventory(item_name, quantity){
  try{
    var check_total_sql = "SELECT SUM(remaining) AS total_quantity " +
                          "FROM inventory, item " +
                          "WHERE inventory.item_id=item.item_id AND " +
                          "item_name='" + item_name + "';";
    let check_total_result = await mysql_tools.runSQLQueryAsync(check_total_sql);
    var inventory_quantity = check_total_result[0].total_quantity;
    if(inventory_quantity == null){
      throw "Error: Not enough " + item_name + ". Requires " + quantity + " you have 0";
    }
    else if(inventory_quantity < quantity){
      throw "Error: Not enough " + item_name + ". Requires " + quantity + " you have " + inventory_quantity;
    }
    return true;
  } catch (err){
    throw err;
  }
}

async function updateUsedIngredients(json_data) {
  var quantities = json_data.quantity;
  var checkInventoryResults = []
  var inventory_info = [];
  try{
    for(ingredient in quantities){
      checkInventoryResults.push(checkTotalInventory(ingredient, quantities[ingredient]));
    }
    await Promise.all(checkInventoryResults);
    //await inventory_tools.updateQBInventory(quantities, json_data.production_date);
    for (ingredient in quantities) {
      let item_id = await db_getters.getItemId(ingredient);
      let deduction_result = await inventory_tools.deductInventory(item_id, quantities[ingredient]);
      inventory_info = inventory_info.concat(deduction_result);
    }
    return inventory_info;
  } catch(err){
    console.log("updateUsedIngredients:" + err);
    throw err;
  }
}

async function createFakeBill(product, total_price, quantity, unit_price, batch_id){
  var bill = {
    "Line": [{
        "Id": "1",
        "Amount": null,
        "DetailType": "AccountBasedExpenseLineDetail",
        "AccountBasedExpenseLineDetail": {
          "AccountRef": {
            "value": null
          }
        }
      },
      {
        "Id": "2",
        "Amount": null,
        "DetailType": "ItemBasedExpenseLineDetail",
        "ItemBasedExpenseLineDetail": {
          "ItemRef": {
            "value": null
          },
          "UnitPrice": null,
          "Qty": null
        }
      }
    ],
    "VendorRef": {
      "value": null
    },
    "PrivateNote": null
  }

  bill.Line[0].Amount = -total_price;
  bill.Line[0].AccountBasedExpenseLineDetail.AccountRef.value = configs.inventory_shrinkage_account;

  bill.Line[1].Amount = total_price;
  bill.Line[1].ItemBasedExpenseLineDetail.UnitPrice = unit_price;
  bill.Line[1].ItemBasedExpenseLineDetail.Qty = quantity;

  bill.VendorRef.value = configs.inhouse_vendor_id;
  bill.PrivateNote = batch_id;

  try{
    let saveResponse = await qb_tools.refreshToken();
    let result = await qb_tools.qbo.findItemsAsync("where name = '" + product + "'");
    if(!result.QueryResponse.hasOwnProperty("Item")){
      throw {"Message":"Please Add Item " + product + " to Quickbooks First"};
    }
    bill.Line[1].ItemBasedExpenseLineDetail.ItemRef.value = result.QueryResponse.Item[0].Id;
    qb_tools.qbo.createBillAsync(bill);
  } catch(err){
    throw err;
  }
}

var exports = {}

exports.getBatches = async function(query_data){
  try{
    var select_sql = "SELECT *, DATE_FORMAT(inventory.date,'%m/%d/%Y') as date " +
                    "FROM batch, item, inventory " +
                    "WHERE batch.batch_id=inventory.object_id AND item.item_id=inventory.item_id AND inventory.object_type='batch';";
    for(attribute in query_data){
      var new_sql = "AND " + attribute + "='" + query_data[attribute] + "' ";
      select_sql += new_sql;
    }
    return mysql_tools.runSQLQueryAsync(select_sql);
  } catch(err){
    throw(err);
  }
}

exports.getMonthlyProduction = async function(product){
  var select_sql = "SELECT YEAR(inventory.date) as year, MONTH(inventory.date) AS month, AVG(cost) AS avg_cost "+
                    "FROM batch, inventory WHERE batch.batch_id=inventory.object_id and inventory.object_type='batch'" + 
                    "GROUP BY YEAR(inventory.date), MONTH(inventory.date) " +
                    "ORDER BY YEAR(inventory.date), MONTH(inventory.date);";
  try{
    let result = await mysql_tools.runSQLQueryAsync(select_sql);
    data = [];
    for(row in result){
      var row_data = {};
      row_data['x'] = result[row].month.toString() + "/" + (result[row].year % 100).toString();
      row_data['y'] = result[row].avg_cost;
      data.push(row_data);
    }
    return data;
  } catch(err){
    throw err;
  }
}

exports.getBatchInfo = async function(batch_id){
  try{
    var select_sql = "SELECT batch_inventory.inventory_id, item_name, inventory.quantity, cost FROM batch_inventory, inventory, item " +
                    "WHERE batch_inventory.item_id=item.item_id and batch_inventory.inventory_id=inventory.inventory_id and " +
                    "batch_id=" + batch_id + ";"
    return mysql_tools.runSQLQueryAsync(select_sql);
  } catch(err){
    throw err;
  }
}

exports.calculateUnitCost = async function(batch_id){
  try{
    let total_cost = await inventory_tools.calculateTotalCost(batch_id);
    var select_batch_sql = "SELECT * FROM batch INNER JOIN inventory ON batch.batch_id=inventory.object_id WHERE batch.batch_id=" + batch_id + " AND object_type='batch';";
    let batch_result = await mysql_tools.runSQLQueryAsync(select_batch_sql);
    var unit_cost = total_cost/batch_result[0].quantity;
    let batch_update_sql = "UPDATE inventory SET cost=" + unit_cost + " WHERE object_type='batch' AND object_id=" + batch_id + ";";
    let batch_update_result = await mysql_tools.runSQLQueryAsync(batch_update_sql);
    return unit_cost;
  } catch(err){
    throw err;
  }
}

exports.postProduction = async function(data){
  var json_data = JSON.parse(data);
  try{
    let inventory_info = await updateUsedIngredients(json_data);
    let item_id = await db_getters.getItemId(json_data.product);
    var user_id = 1;

    if(json_data.water_act_lvl_1){
      var insert_batch_sql = "INSERT into batch(expiration_date,waste,user_id,water_act_lvl_1,water_act_lvl_2,water_act_lvl_3) VALUES (?,?,?,?,?,?);";
      var insert_batch_values = [json_data.expiration_date, json_data.waste, user_id, json_data.water_act_lvl_1, json_data.water_act_lvl_2, json_data.water_act_lvl_3]
    }
    else {
      var insert_batch_sql = "INSERT into batch(expiration_date, user_id) VALUES (?,?);";
      var insert_batch_values = [json_data.expiration_date, user_id];
    }

    let conn = await mysql_tools.getSQLConnectionAsync();
    await conn.beginTransaction();                                     
    let result = await conn.query(insert_batch_sql, insert_batch_values);
    var batch_id = result.insertId;
    var quantity = json_data.quantity_produced
    var insert_inventory_sql = "INSERT into inventory(item_id, object_type, object_id, date, quantity, cost, remaining) VALUES (?,?,?,?,?,?,?)";
    var insert_inventory_values = [item_id, "batch", batch_id, json_data.production_date, quantity, 0, quantity];
    let insert_inventory_results = mysql_tools.runSQLQueryAsync(insert_inventory_sql, insert_inventory_values);

    var insert_results = [];
    var subtraction_log_results = [];
    for (i in inventory_info){
      var insert_production_sql = "INSERT into batch_inventory(batch_id, inventory_id, quantity) VALUES (?,?,?);";
      var insert_production_values = [batch_id, inventory_info[i].inventory_id, inventory_info[i].quantity];
      var insert_production_query = mysql_tools.format(insert_production_sql, insert_production_values);
      insert_results.push(conn.query(insert_production_query));

      var update_subtraction_log_sql = "INSERT into subtraction_log(date, item_id, quantity, ref_id, ref_type) VALUES (?,?,?,?,?);";
      var update_subtraction_log_values = [json_data.production_date, item_id, inventory_info[i].quantity, batch_id, "batch"];
      var update_subtraction_log_query = mysql_tools.format(update_subtraction_log_sql, update_subtraction_log_values);
      subtraction_log_results.push(conn.query(update_subtraction_log_query));
    }
    await Promise.all(insert_results);
    await Promise.all(subtraction_log_results);
    await conn.commit();
    conn.end();
    await insert_inventory_results;
    let unit_cost = await this.calculateUnitCost(batch_id);
    //await createFakeBill(json_data.product, total_cost, json_data.quantity_produced, unit_cost, batch_id);
    json_data.cost = unit_cost;
    return json_data;
  } catch(err){
    throw(err);
  }
}

module.exports = exports;
