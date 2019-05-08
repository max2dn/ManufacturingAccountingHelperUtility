var mysql_tools = require('./mysql_tools.js')
var db_getters = require('./database_getters.js')

async function getFinishedGoodUOM(product){
  try{
    var select_sql = "SELECT uom, category FROM item WHERE item_name='" + product+"';";
    return mysql_tools.runSQLQueryAsync(select_sql);
  } catch(err){
    console.log(err);
  }
}

async function getIngredientList(product){
  try{
    var select_sql = "SELECT raw.item_name AS ingredient, raw.uom AS unit " +
              "FROM recipe, item AS finished_good, item as raw " +
              "WHERE recipe.fg_id=finished_good.item_id AND " +
              "recipe.raw_item_id=raw.item_id AND " +
              "finished_good.item_name='"+product+"'";
    return mysql_tools.runSQLQueryAsync(select_sql);
  } catch(err){
    console.log(err);
  }
}

async function addRecipeItems(json_data, conn){
  try{
    var ingredients = json_data.ingredients;
    let fg_id = await db_getters.getItemId(json_data.product)
    var mysql_promises = [];
    var insert_sql_template = "INSERT into recipe(fg_id, raw_item_id) VALUES ";
    for(i=0; i<ingredients.length; i++){
      var ingredient = ingredients[i].ingredient;
      let raw_item_id = await db_getters.getItemId(ingredient);
      var insert_sql = insert_sql_template + "(" + fg_id + "," + raw_item_id + ")";
      mysql_promises.push(conn.query(insert_sql));
    }
    await Promise.all(mysql_promises);
  } catch(err){
    console.log(err);
  }
}

async function deleteRecipeItems(product, conn){
  try{
    let fg_id = await db_getters.getItemId(product);
    var delete_sql = "DELETE FROM recipe WHERE fg_id=" + fg_id;
    return conn.query(delete_sql);
  } catch(err){
    console.log(err)
  }
}

async function updateFinishedGood(json_data, conn){
  try{
    var update_sql = "UPDATE item SET category='" + json_data.category + "' " +
                     "WHERE item_name='" + json_data.product + "'";
    return conn.query(update_sql);
  } catch(err){
    console.log(err);
    throw err;
  }
}

async function addFinishedGood(json_data, conn){
  try{
    let fg_id = await db_getters.getItemId(json_data.product);
    if(fg_id === -1){
      var insert_sql = "INSERT into item(item_name, uom, type, active, category) " +
                       "VALUES ('" + json_data.product + "','" +
                       json_data.unit + "', 'finished_good', true, '" +
                       json_data.category + "');";
      return conn.query(insert);
    }
    else{
      var update_sql = "UPDATE item SET active=true " +
                       "WHERE item_name='" + json_data.product +"';";
      return conn.query(update_sql);
    }
  } catch(err){
    console.log(err);
  }
}

async function getItems(type){
  var sql = "SELECT item_name FROM item WHERE type='" + type + "';";
  try{
    return mysql_tools.runSQLQueryAsync(sql);
  } catch(err){
    throw err;
  }
}

var exports = {};

exports.getRawItems = async function(){
  try{
    return getItems("raw");
  } catch(err){
    throw err;
  }
}

exports.getSuppliesItems = async function(){
  try{
    return getItems("supplies");
  } catch(err){
    throw err;
  }  
}

exports.getNonConfiguredItems = async function(){
  var sql = "SELECT item_name FROM item WHERE category IS NULL and type='finished_good';"
  try{
    return mysql_tools.runSQLQueryAsync(sql);
  } catch(err){
    throw err;
  }
}

exports.getProducts = async function(){
  var sql = "SELECT item_name, category FROM item WHERE type='finished_good' and active=true;";
  try{
    return mysql_tools.runSQLQueryAsync(sql);
  } catch(err){
    throw err;
  }
}

exports.getIngredients = async function(product){
  try{
    return getIngredientList(product);
  } catch(err){
    throw err;
  }
}

exports.getRecipe = async function(product){
  try{
    var json_data = {};
    json_data.product = product;
    let item_result = await db_getters.getItem(product);
    if(item_result.length == 0){
      throw "Error getRecipe: Item Not Found " + product;
    }
    json_data.unit=item_result[0].uom;
    json_data.category = item_result[0].category;
    let ingredients_result = await getIngredientList(product);
    var ingredients = [];
    for(i=0; i<ingredients_result.length; i++){
      ingredients.push({"ingredient":ingredients_result[i].ingredient});
    }
    json_data.ingredients=ingredients;
    return json_data;
  } catch(err){
    throw err;
  }
}

exports.updateRecipe = async function(data){
  var json_data = JSON.parse(data);
  try{
    let conn = await mysql_tools.getSQLConnectionAsync();
    await conn.beginTransaction();
    await updateFinishedGood(json_data, conn);
    await deleteRecipeItems(json_data.product, conn);
    await addRecipeItems(json_data, conn);
    let result = await conn.commit();
    return result;
  } catch(err){
    if (typeof variable !== 'undefined') {
      conn.rollback();
    }
    console.log(err);
  }
}

exports.deleteRecipe = async function(product){
  try{
    let conn = await mysql_tools.getSQLConnectionAsync();
    await conn.beginTransaction();
    await deleteRecipeItems(product, conn);
    var update_sql = "UPDATE item SET active=false WHERE item_name='" + product +"';";
    await conn.query(update_sql);
    let result = await conn.commit();
    return result;
  } catch(err){
    conn.rollback();
    console.log(err);
  }
}

exports.postRecipe = async function(data){
  var json_data = JSON.parse(data);
  try{
    let conn = await mysql_tools.getSQLConnectionAsync();
    await conn.beginTransaction();
    await addFinishedGood(json_data, conn);
    await addRecipeItems(json_data, conn);
    let result = await conn.commit();
    return result;
  } catch(err){
    conn.rollback();
    console.log(err);
  }
}

module.exports = exports;
