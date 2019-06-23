var mysql_tools = require('./mysql_tools.js');
var exports = {};

exports.updateInMemoryConfigs = async function(){
  try{
    let config_data = await mysql_tools.runSQLQueryAsync("SELECT * from config;");
    var config_dict = {};
    for(i in config_data){
      if(config_data[i].config_id == null)
        config_dict[config_data[i].config_key] = config_data[i].config_value;
      else
        config_dict[config_data[i].config_key] = config_data[i].config_id;
    }
    exports.client_id = config_dict.client_id;
    exports.client_secret = config_dict.client_secret;
    exports.fg_asset_account = config_dict.fg_asset_account;
    exports.inhouse_vendor_id = config_dict.inhouse_vendor;
    exports.raw_item_asset_account = config_dict.raw_item_asset_account;
    exports.supplies_asset_account = config_dict.supplies_asset_account;
    exports.manufacturing_sales_account = config_dict.manufacturing_sales_account;
    exports.frozen_goods_sales_account = config_dict.frozen_goods_sales_account;
    exports.inventory_shrinkage_account = config_dict.inventory_shrinkage_account;
    exports.realm_id = config_dict.realm_id;
    return this;
  } catch(err){
    console.log(err);
  }
};

exports.getConfigs = async function(){
  return mysql_tools.runSQLQueryAsync("SELECT * FROM config;");
}

exports.init = async function(){
  try{
    return this.updateInMemoryConfigs();
  } catch(err){
    process.exit(1);
  }
};

exports.init();

module.exports = exports;
