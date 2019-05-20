var mysql_tools = require('./mysql_tools.js')

exports = {};

async function insertIntoLog(date, item_id, quantity, ref_id, ref_type){
    try{
        var insert_sql = "INSERT INTO subtraction_log(date, item_id, quantity, ref_id, ref_type) VALUES (?,?,?,?,?);";
        var insert_values = [date, item_id, quantity, ref_id, ref_type];
        return mysql_tools.runSQLQueryAsync(insert_sql, insert_values);
    } catch(err) {
        throw err;
    }
}

exports.insertFromBatch = async function(date, item, quantity, batch_id){
    try{
        return insertIntoLog(date, item, quantity, batch_id, "batch");
    } catch(err){
        throw err;
    }
};

exports.insertFromInvoice = async function(date, item, quantity, invoice_id){
    try{
        return insertIntoLog(date, item, quantity, invoice_id, "invoice");
    }catch(err){
        throw err;
    }
};

exports.insertFromSale = async function(date, item, quantity, sale_id){
    try{
        return insertIntoLog(date, item, quantity, sale_id, "sale");
    }catch(err){
        throw err;
    }
};

exports.insertFromAdjustment = async function(date, item, quantity, adjustment_id){
    try{
        return insertIntoLog(date, item, quantity, adjustment_id, "adjustement")
    }catch(err){
        throw err;
    }
};

module.exports = exports;

