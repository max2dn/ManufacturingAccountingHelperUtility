function getBatchDetails(){
  console.log(window.clicked_item);
  var xhr = createCORSRequest('GET', base_url + '/batchinfo?batch_id='+ window.clicked_item);
  console.log(JSON.parse(xhr.response));
  xhr.send();
  var json_data = JSON.parse(xhr.response);
  return json_data;
}

/*function displayBatchDetails(rowData){
  var batchDetails = getBatchDetails(rowData);

  var batchNumber = rowData.batch_id;
  var finishedGood = rowData.item_name;
  var productionDate = rowData.production_date;
  var quantity = rowData.quantity;
  var batchUnitCost = rowData.cost;
  var water1 = rowData.water_act_lvl_1;
  var water2 = rowData.water_act_lvl_2;;
  var water3 = rowData.water_act_lvl_3;;


for(var i=0;i<batchDetails.length;i++){
  console.log(batchDetails[i].item_name);
}
  console.log(batchDetails);
  console.log(batchDetails.length);
  console.log(batchDetails[0]);
  console.log(batchDetails[0].item_name);

}*/


getBatchDetails();
