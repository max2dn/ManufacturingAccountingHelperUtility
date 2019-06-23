var qb_tools = require('../util/quickbooks_tools.js')
var exports = {} 

exports.getInHouseVendor = async function(inhouse_vendor_name){
  try{
    var querySQL = "WHERE DisplayName = '" + inhouse_vendor_name + "'";
    let refreshResponse = await qb_tools.refreshToken();
    let vendorsResponse = await qb_tools.qbo.findVendorsAsync(querySQL);
    if(Object.keys(vendorsResponse.QueryResponse).length === 0){
      throw {"Message": "Error finding vendor. Ensure name matches exactly"};
      return;
    }
    return vendorsResponse.QueryResponse.Vendor[0].Id;
  } catch(err){
    throw err;
  }
}

exports.getAccountByName = async function(account_name){
  try{
    var querySQL = "WHERE Name = '" + account_name + "'";
    let refreshResponse = await qb_tools.refreshToken();
    let accountsResponse = await qb_tools.qbo.findAccountsAsync(querySQL);
    if(Object.keys(accountsResponse.QueryResponse).length === 0){
      throw {"Message": "Error finding account. Ensure name matches exactly"};
      return;
    }
    return accountsResponse.QueryResponse.Account[0].Id;
  } catch(err){
    throw err;
  }
}

module.exports = exports;