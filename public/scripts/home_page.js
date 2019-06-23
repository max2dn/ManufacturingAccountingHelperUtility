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
    var xhr = createCORSRequest('GET', base_url + '/api/inventory/raw');
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
    var xhr = createCORSRequest('GET', base_url + '/api/inventory/supplies');
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
    var xhr = createCORSRequest('GET', base_url + '/api/inventory/finishedgoods');
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

function rawInventoryLabels(){
  var xhr = createCORSRequest('GET', base_url + '/api/inventory/raw');
  xhr.send();
  var json_data = JSON.parse(xhr.response);

  var labels = []
  for(var i=0;i<json_data.length;i++){
    labels.push(json_data[i].product)
  };
  return labels
}

function groupArray(fullArray, chunk_size){
    var results = [];

    while (fullArray.length) {
        results.push(fullArray.splice(0, chunk_size));
    }

    return results;
}

function rawInventoryQuantities(){
  var xhr = createCORSRequest('GET', base_url + '/api/inventory/raw');
  xhr.send();
  var json_data = JSON.parse(xhr.response);

  var quantity = []
  for(var i=0;i<json_data.length;i++){
    quantity.push(json_data[i].quantity)
  };
  return quantity
}

function fgInventoryLabels(){
  var xhr = createCORSRequest('GET', base_url + '/api/inventory/finishedgoods');
  xhr.send();
  var json_data = JSON.parse(xhr.response);

  var labels = []
  for(var i=0;i<json_data.length;i++){
    labels.push(json_data[i].product)
  };
  return labels
}
function fgInventoryQuantities(){
  var xhr = createCORSRequest('GET', base_url + '/api/inventory/finishedgoods');
  xhr.send();
  var json_data = JSON.parse(xhr.response);

  var quantity = []
  for(var i=0;i<json_data.length;i++){
    quantity.push(json_data[i].quantity)
  };
  return quantity;
}

function supplyInventoryLabels(){
  var xhr = createCORSRequest('GET', base_url + '/api/inventory/supplies');
  xhr.send();
  var json_data = JSON.parse(xhr.response);

  var labels = []
  for(var i=0;i<json_data.length;i++){
    labels.push(json_data[i].product)
  };
  return labels
}
function supplyInventoryQuantities(){
  var xhr = createCORSRequest('GET', base_url + '/api/inventory/supplies');
  xhr.send();
  var json_data = JSON.parse(xhr.response);

  var quantity = []
  for(var i=0;i<json_data.length;i++){
    quantity.push(json_data[i].quantity)
  };
  return quantity;
}

function syncInventory(){
  var xhr = createCORSRequest('GET', base_url + '/api/actions/sync');
  xhr.send();
}

function checkNonConfiguredItems(){
  var xhr = createCORSRequest('GET', base_url + '/api/items/nonconfigured');
  xhr.send();
  var json_data = JSON.parse(xhr.response);

  if (json_data.length > 0){
    var items = ""
    for(var i=0;i<json_data.length;i++){
      items = items + json_data[i].item_name + "<br />";
    };
    var notificationBox = $('#notification');
    var notification = "<p class=message>"+"Please input the recipe for the following items:<br />" + items + "</p>";
    notification.className="message";
    notificationBox.append(notification);
    var modal = $('#notification_modal');
    modal.show();
    //alert("Please input the recipe for the following items:\n" + items)
  }
}

$(document).ready(function() {

  $('#navigation').load('/public/modules/navigation_menu.html');

  checkNonConfiguredItems();
  $('#close_form').on('click',function(){
    document.getElementById('notification_modal').remove();
  });


// Display inventory table and default open finished goods

  //syncInventory();
  getRawInventory();
  getSuppliesInventory();
  getFinishedInventory();
  $('.tablink').on('click', function() {
      displayTableGraph(event, this.name)
    });
  document.getElementById('defaultOpen').click();


  Chart.pluginService.register({
    beforeDraw: function (chart) {
      if (chart.config.options.elements.center) {
    //Get ctx from string
    var ctx = chart.chart.ctx;

    //Get options from the center object in options
    var centerConfig = chart.config.options.elements.center;
    var fontStyle = centerConfig.fontStyle || 'Arial';
    var txt = centerConfig.text;
    var color = centerConfig.color || '#000';
    var sidePadding = centerConfig.sidePadding || 20;
    var sidePaddingCalculated = (sidePadding/100) * (chart.innerRadius * 2)
    //Start with a base font of 30px
    ctx.font = "30px " + fontStyle;

    //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
    var stringWidth = ctx.measureText(txt).width;
    var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

    // Find out how much the font can grow in width.
    var widthRatio = elementWidth / stringWidth;
    var newFontSize = Math.floor(30 * widthRatio);
    var elementHeight = (chart.innerRadius * 2);

    // Pick a new font size so it will not be larger than the height of label.
    var fontSizeToUse = Math.min(newFontSize, elementHeight);

    //Set font settings to draw it correctly.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
    var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
    ctx.font = fontSizeToUse+"px " + fontStyle;
    ctx.fillStyle = color;

    //Draw text in center
    ctx.fillText(txt, centerX, centerY);
        }
      }
  });

//Chart 1 - Finished Goods
  var colorArray = ['#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
      '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
      '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
      '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
      '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
      '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
      '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
      '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
      '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
      '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',];
  var fgConfig = {
      type: 'doughnut',
      data: {
          labels:rawInventoryLabels(),
          datasets: [
            {
            data: rawInventoryQuantities(),
            backgroundColor:colorArray
          },
          ]
      },
      options: {
        maintainAspectRatio: false,
        elements: {
          center: {
            text: 'Finished Goods',
            color: 'grey',
            fontStyle: 'Quicksand',
            sidePadding: 20
          }
      },
        legend:{
            display:false,
          }
      },
    };
  var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, fgConfig);

//Chart 2 - Raw Materials
  var colorArray = ['#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',];
  var rawConfig = {
    type: 'doughnut',
    data: {
        labels:rawInventoryLabels(),
        datasets: [
          {
          data: rawInventoryQuantities(),
          backgroundColor:colorArray
        },
        ]
    },
    options: {
      maintainAspectRatio: false,
      elements: {
        center: {
          text: 'Raw Materials',
          color: 'grey',
          fontStyle: 'Quicksand',
          sidePadding: 20
        }
    },
      legend:{
          display:false,
        }
    },
  };
  var ctx2 = document.getElementById("myChart2").getContext("2d");
  var myChart2 = new Chart(ctx2, rawConfig);


//Chart 3 - Supply
  var colorArray = ['#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',
    '#97BDC9', '#40798C', '#70A9A1', '#9EC1A3', '#CFE0C3',];
  var supplyConfig = {
    type: 'doughnut',
    data: {
        labels:supplyInventoryLabels(),
        datasets: [
          {
          data: supplyInventoryQuantities(),
          backgroundColor:colorArray
        },
        ]
    },
    options: {
      maintainAspectRatio: false,
      elements: {
        center: {
          text: 'Supplies',
          color: 'grey',
          fontStyle: 'Quicksand',
          sidePadding: 20
        }
    },
      legend:{
          display:false,
        }
    },
  };
  var ctx3 = document.getElementById("myChart3").getContext("2d");
  var myChart3 = new Chart(ctx3, supplyConfig);

})
