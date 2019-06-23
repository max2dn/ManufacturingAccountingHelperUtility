function populateProductDropdown(){
  var xhr = createCORSRequest('GET', base_url + '/api/items/finishedgoods');
  xhr.send();
  var product_dropdown = document.getElementById("select_product_dropdown");
  console.log(product_dropdown)
  var json_data = JSON.parse(xhr.response);
  for (var i=0; i<json_data.length; i++){
    var option_item = document.createElement("option");
    option_item.text = json_data[i]["item_name"];
    option_item.value = json_data[i]["item_name"];
    option_item.className= json_data[i]["category"];/* Fishcake or Non-Fishcake */
    product_dropdown.add(option_item);
  }
}

function populateRecipeTable(product){
  var todays_date = new Date();
  var expirationDate = new Date();
  expirationDate.setDate(todays_date.getDate() + 60);
  document.getElementsByClassName('date_picker')[0].valueAsDate = todays_date;
  document.getElementsByClassName('date_picker')[1].valueAsDate = expirationDate;

  var xhr = createCORSRequest('GET', base_url + '/api/recipe/ingredients?finishedgood=' + product);
  xhr.send();
  var old_tbody = document.getElementById("recipe_table").childNodes[1];
  var new_tbody = document.createElement('tbody');
  var json_data = JSON.parse(xhr.response);

  console.log(json_data);

  // Add ingredients to table
  for (var i=0; i<json_data.length; i++){
    var table_row = document.createElement("tr");
    var ingredient_td = document.createElement("td");
    var quantity_td = document.createElement("td");
    var unit_td = document.createElement("td");

    // Create nodes
    ingredient_text = document.createTextNode(json_data[i]["ingredient"]);

    quantity_box = document.createElement("input");
    quantity_box.setAttribute("type", "number");
    quantity_box.setAttribute("min", "0");
    quantity_box.setAttribute("name", json_data[i]["ingredient"])
    quantity_box.setAttribute("class", "quantity");
    if(i==0)
      var first_quantity_box = quantity_box;

    unit_text = document.createTextNode(json_data[i]["unit"]);

    // Appending nodes to td
    ingredient_td.appendChild(ingredient_text);
    quantity_td.appendChild(quantity_box);
    unit_td.appendChild(unit_text);

    // Appending td to tr
    table_row.appendChild(ingredient_td);
    table_row.appendChild(quantity_td);
    table_row.appendChild(unit_td);

    // Appending tr to table
    new_tbody.appendChild(table_row);
  }

  old_tbody.parentNode.replaceChild(new_tbody, old_tbody);
}

function getFormData(){
  var json_data = {};

  var productionDate = new Date($('#production_date').val());
  json_data["production_date"] = productionDate.toISOString().replace(/T.*/,'');

  var expirationDate = new Date($('#expiration_date').val());
  json_data["expiration_date"] = expirationDate.toISOString().replace(/T.*/,'');

  json_data["product"] = document.getElementById("select_product_dropdown").value;

  var elements = document.getElementsByClassName('quantity');
  var quantity_data = {};
  for(var i=0; i<elements.length; i++){
    var element = elements[i];
    var ingredient = element.name;
    var quantity = element.value;
    quantity_data[ingredient]=quantity;
  }
  json_data["quantity"] = quantity_data;

  var results = document.getElementsByClassName('result');
  for(var i=0; i<results.length; i++){
    var result = results[i];
    json_data[result.name] = result.value;
  }
  if(hasBlanks(json_data)){
    return null;
  }
  console.log(json_data);
  return JSON.stringify(json_data);
}

function submitForm(){
  $("#submit_button").click(function(event){
      event.preventDefault();
      var xhr = createCORSRequest('POST', base_url + '/api/production');
      xhr.setRequestHeader("Content-Type", "text/plain;");
      var form_data=getFormData()
      if(form_data === null){
        alert("Hey Felicia: All Fields Must Be Filled In");
        return;
      }
      xhr.send(form_data);
      document.getElementById('production_form').remove();

      var json_response = JSON.parse(xhr.response);
      if(xhr.status != 200){
        $('#modal').load('/public/modules/failed_submission.html',function(){
          populateFailedSubmission(json_response);
        })
      } else{
        $('#modal').load('/public/modules/successful_submission.html',function(){
          populateSuccessfulSubmission(json_response);
        })
      }
  });
}

function populateSuccessfulSubmission(json_response){
  $('#product_name').text(json_response['product']);
  $('#unit_cost').text(formatter.format(json_response['cost']));

  var modal = document.getElementById('modal');
      modal.onclick = function(event) {
      location.reload();
  };
}

function populateFailedSubmission(json_response){
  $('#message').text(json_response);
  var modal = document.getElementById('modal');
  modal.onclick = function(event) {
      location.reload();
  };
}

function resetForm(){
  $('#form_reset_button').on('click',function(){
      if(confirm("Are you sure you want to clear the form?")){
        var select_product_dropdown = document.getElementById('select_product_dropdown')
        var finished_good = select_product_dropdown.value;
        document.getElementById('production_form').reset();
        select_product_dropdown.value = finished_good;
      }
    });
}

function connectQB(){
  var win;
  var checkConnect;
  var parameters = "location=1,width=800,height=650";
  parameters += ",left=" + (screen.width - 800) / 2 + ",top=" + (screen.height - 650) / 2;
  // Launch Popup
  win = window.open("http://localhost/node/requestToken", 'connectPopup', parameters);
}

function createAlert() {
  alert("Connected to QuickBooks");
}

function closeModal(){
  document.getElementById('production_form').reset();
  document.getElementById('modal').remove();
}

// Start of Functions
populateProductDropdown();

$("#select_product_dropdown").change(function() {
    var product = this.value;
      if ($('option:selected').hasClass('fishcake')){
          $("#type_form").load('/public/modules/enter_production_fishcake.html', function () {
            populateRecipeTable(product);
            submitForm();
            resetForm();
          })
      }
      else {
        $("#type_form").load('/public/modules/enter_production_non-fishcake.html', function () {
          populateRecipeTable(product);
          submitForm();
          resetForm();
      })
    };
});

$('#close_button').on('click',closeModal);

var modal = document.getElementById('modal');
window.onclick = function(event) {
    if (event.target == modal) {
        modal.remove();
    }
};
