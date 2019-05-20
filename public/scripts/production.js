//Production Table
function populateProductionTable() {
  var xhr = createCORSRequest('GET', base_url + '/production');
  xhr.send();
  var json_data = JSON.parse(xhr.response);
  return json_data;
}
function getBatchDetails(){
  var xhr = createCORSRequest('GET', base_url + '/batchinfo?batch_id='+ window.clicked_item);
  xhr.send();
  var json_data = JSON.parse(xhr.response);
  return json_data;
}
function displayBatchDetails(rowData,batchDetails){
  var batchNumber = rowData.batch_id;
  var finishedGood = rowData.item_name;
  var productionDate = rowData.date;
  var quantity = rowData.quantity;
  var batchUnitCost = formatter.format(rowData.cost);
  var waste = rowData.waste;
  var water1 = rowData.water_act_lvl_1;
  var water2 = rowData.water_act_lvl_2;
  var water3 = rowData.water_act_lvl_3;

  $('#product').text(finishedGood);
  $('#production_date').text(productionDate);
  $('#batch_number').text('Batch #:'+ batchNumber);
  $('#quantity_produced').text(quantity);
  $('#batch_unit_cost').html(batchUnitCost);
  $('#waste').text(waste);


  for(var i=0;i<batchDetails.length;i++){
      var tr = $('<tr></tr>');
      var item = '<td>'+ batchDetails[i].item_name + '</td>';
      var quantity = '<td>'+ batchDetails[i].quantity + '</td>';
      var cost=formatter.format(batchDetails[i].cost);
      var cost = '<td>'+ cost + '</td>';

      tr.append(item,quantity,cost);
      $('#batch_details').append(tr);
  }

  if (rowData.category === "fishcake"){
    $('#water_activity').show();
    $('#water_activity').append(
          '<tr>'+
              '<td>'+'Level 1 : '+ water1+'</td>'+
              '<td>'+'Level 2 : '+ water2+'</td>'+
              '<td>'+'Level 3 : '+ water3+'</td>'+
          '</tr>'
    )}
}
function isUndefined(myVar) {
  if (myVar.includes('undefined')) {
    return true;
  }
  return false;
}


//Inventory Dashboard 
function displayTableGraph(e, category) {
  // Get tables and do not display
  var tabContent = document.getElementsByClassName('tabcontent');
  for (i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  };

  var tabLinks = document.getElementsByClassName('tablink');
  for (i = 0; i < tabLinks.length; i++) {
    tabLinks[i].className = tabLinks[i].className.replace(" active", "");
  };
  var content = document.getElementsByClassName(category);
  for (i = 0; i < content.length; i++) {
    content[i].style.display = "block";
  };
  e.currentTarget.className += " active";
}
function getRawInventory(){
  var xhr = createCORSRequest('GET', base_url + '/rawinventory');
  xhr.send();
  var json_data = JSON.parse(xhr.response);

  for(var i=0;i<json_data.length;i++){
    var tableRow = $('<tr></tr>').addClass('table_row');
    var itemCell = '<td>' + json_data[i].product + '</td>';
    var costCell = '<td>' +'$'+ json_data[i].cost + '</td>';
    var quantityCell = '<td>' + json_data[i].quantity + '</td>';
    tableRow.append(itemCell, costCell, quantityCell);
    $('#raw_ingredient_table').append(tableRow);
  };
}
function getSuppliesInventory(){
  var xhr = createCORSRequest('GET', base_url + '/suppliesinventory');
  xhr.send();
  var json_data = JSON.parse(xhr.response);

  for(var i=0;i<json_data.length;i++){
    var tableRow = $('<tr></tr>').addClass('table_row');
    var itemCell = '<td>' + json_data[i].product + '</td>';
    var costCell = '<td>' +'$'+ json_data[i].cost + '</td>';
    var quantityCell = '<td>' + json_data[i].quantity + '</td>';
    tableRow.append(itemCell, costCell, quantityCell);
    $('#supplies_table').append(tableRow);
  };
}
function getFinishedInventory(){
  var xhr = createCORSRequest('GET', base_url + '/finishedinventory');
  xhr.send();
  var json_data = JSON.parse(xhr.response);
  for(var i=0;i<json_data.length;i++){
    var tableRow = $('<tr></tr>').addClass('table_row');
    var itemCell = '<td>' + json_data[i].product + '</td>';
    var costCell = '<td>' + '$'+ json_data[i].cost + '</td>';
    var quantityCell = '<td>' + json_data[i].quantity + '</td>';
    tableRow.append(itemCell, costCell, quantityCell);
    $('#finished_good_table').append(tableRow);
};
}

//For Chart 
function getMonthlyAverage() {
  var xhr = createCORSRequest('GET', base_url + '/monthlyproduction?product=Uzumaki');
  xhr.send();
  var json_data = JSON.parse(xhr.response);
  console.log(json_data);
  return json_data;
}
function fgInventoryLabels(){
  var xhr = createCORSRequest('GET', base_url + '/finishedinventory');
  xhr.send();
  var json_data = JSON.parse(xhr.response);

  var labels = []
  for(var i=0;i<json_data.length;i++){
    labels.push(json_data[i].product)
  };
  return labels
}
function fgInventoryQuantities(){
  var xhr = createCORSRequest('GET', base_url + '/finishedinventory');
  xhr.send();
  var json_data = JSON.parse(xhr.response);

  var quantity = []
  for(var i=0;i<json_data.length;i++){
    quantity.push(json_data[i].quantity)
  };
  return quantity;
}


$(document).ready(function() {
  $('#navigation').load('/modules/navigation_menu.html');

  getRawInventory();
  getSuppliesInventory();
  getFinishedInventory();
  $('.tablink').on('click', function() {
      displayTableGraph(event, this.name)
    });
  document.getElementById('defaultOpen').click();

  $('#open_form').on('click', function() {
    $('#enter_production').load('/modules/enter_production.html', function() {
      $.getScript('/scripts/enter_production.js')
    });
  });

//Table: Load
  var json_data = populateProductionTable()
  var table = $('#myTable').DataTable({
    'data': json_data,
    'columns': [
      {
        "className":'details-control',
        "orderable": false,
        "data": null,
        "defaultContent": ''
      },
      {
        'data': "batch_id"
      },
      {
        'data': "item_name"
      },
      {
        'data': "date",
      },
      {
        'data': "quantity"
      },
      {
        'data': "cost",
        render: $.fn.dataTable.render.number(',', '.', 2, '$')
      },
      {
        'data': "waste",
        "defaultContent": 'N/A'
      },
    ],
    "dom": 'lfrtBp',
    "buttons": [
        'excel', 'pdf'
    ],
    "order": [[ 0, "desc" ]]
  });
// Table: View Batch Details
  $('#myTable tbody').on('click', 'td.details-control', function () {
    var tr = $(this).closest('tr');
    var row = table.row( tr );
    var rowData = row.data();
    window.clicked_item = row.data().batch_id;
    var xhr = createCORSRequest('GET', base_url + '/batchinfo?batch_id='+ window.clicked_item);
    xhr.send();
    var json_data = JSON.parse(xhr.response);

      $('#view_batch').load('/modules/view_batch_details.html',function(){
        displayBatchDetails(rowData,json_data);
    });
  });
//Table: Date Filter
  $('#start, #end').change(function() {
    $.fn.dataTable.ext.search.push(
      function(settings, data, dataIndex) {
        var from = $('#start').val().split('-');
        var start = from[1] + '/' + from[2] + '/' + from[0];
        var to = $('#end').val().split('-');
        var end = to[1] + '/' + to[2] + '/' + to[0];
        var date = data[3];
        if (isUndefined(start) && isUndefined(end)) {
          return true;
        }
        if (isUndefined(start) && date <= end) {
          return true;
        }
        if (isUndefined(end) && date >= start) {
          return true;
        }
        if (date <= end && date >= start) {
          return true;
        }
        return false;
      }
    );
    $('#myTable').DataTable().draw();
  });

//Chart JS
/*getMonthlyAverage();

  var timeFormat = 'MM/DD/YYYY';
  var ctx = document.getElementById("myChart");
  var chart = new Chart(ctx, {
        type:    'line',
        data:    {
            datasets: [
                {
                    label: "Kamaboko",
                    data: getMonthlyAverage(),
                    fill: false,
                    borderColor: '#F25A52'
                },
            ]
        },
        options: {
            maintainAspectRatio: false,
            title:      {
                display: true,
                text:    "Av. Monthly Unit Cost"
            },
            legend:     {
              labels:{
                boxWidth: 20
              }
            },
            scales:     {
                xAxes: [{
                    type:       "time",
                    time:       {
                        format: timeFormat,
                        unit : 'quarter',
                        tooltipFormat: 'll'
                    },
                    gridLines:{
                        display: false
                      }
                }],
                yAxes: [{
                    scaleLabel: {
                        display:     true,
                        labelString: 'Cost'
                    },
                    gridLines:{
                      display: false
                    }
                }]
            }
        }
    })*/

})
