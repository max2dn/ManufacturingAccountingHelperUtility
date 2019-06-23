var mysql_tools = require('../util/mysql_tools.js');
var configs = require('../util/config.js');
var inventory_tools = require('../util/inventory_tools.js');
var qb_tools = require('../util/quickbooks_tools.js')
var items = require('../util/items.js');
var exports = {};

exports.parseInvoiceSalesReceiptLines = async function(item){
  for(line in item.Line){
    var line = item.Line[line];
    if (line.DetailType != "SalesItemLineDetail"){
      continue;
    }
    var item_detail = line.SalesItemLineDetail;
    var item_id = item_detail.ItemRef.value;
    let item_type = await items.getItemType(item_id);
    if(item_type == null)
      throw "Could not get item type of item " + item_detail.ItemRef.name;
    //TO-DO Change to deduct inventory from finished goods as well as raw goods
    switch(item_type){
      case "raw":
        await inventory_tools.deductRawInventory(item_id, item_detail.Qty);
        break;
      case "supplies":
        break;
      case "finishedgood":
        break;
      default:
        break;
    }
  }
}
  
exports.processNewInvoices = async function(last_inventory_update){
  var querySQL = "WHERE VendorRef != '" + configs.inhouse_vendor_id + "' AND MetaData.LastUpdatedTime >= '" + last_inventory_update + "'";
  try{
    let invoices = await qb_tools.qbo.findInvoicesAsync();
    for(i in invoices.QueryResponse.Invoice){
      await parseInvoiceSalesReceiptLines(invoices.QueryResponse.Invoice[i]);
    }
  } catch (err){
    console.log(err);
  }
}

exports.processUpdatedInvoices = async function(last_inventory_update){

}
  
exports.processNewSalesReceipts = async function(last_inventory_update){
  var querySQL = "WHERE VendorRef != '" + configs.inhouse_vendor_id + "' AND MetaData.LastUpdatedTime >= '" + last_inventory_update + "'";
  try{
    let sales_receipts = await qb_tools.qbo.findSalesReceiptsAsync(querySQL);
    for(i in sales_receipts.QueryResponse.SalesReceipt){
      await parseInvoiceSalesReceiptLines(sales_receipts.QueryResponse.SalesReceipt[i]);
    }
  } catch (err){
    console.log(err);
  }
}

exports.processUpdatedSalesReceipts = async function(last_inventory_update){

}

module.exports = exports;