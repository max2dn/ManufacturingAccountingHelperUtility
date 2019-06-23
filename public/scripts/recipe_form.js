function populateIngredientDropdown() {
  var xhr = createCORSRequest('GET', base_url + '/api/items/raw');
  xhr.send();
  var product_dropdown = document.getElementById("select_ingredient_dropdown");
  var json_data = JSON.parse(xhr.response);
  for (var i = 0; i < json_data.length; i++) {
    var option_item = document.createElement("option");
    option_item.text = json_data[i]["item_name"];
    option_item.value = json_data[i]["item_name"];
    product_dropdown.add(option_item);
  }
}

function getFormData() {
  var json_data = {};
  json_data["product"] = document.getElementById("product").value;
  json_data["unit"] = document.getElementById("product_unit").value;

  var rows = document.getElementsByClassName('table_row');
  var ingredient_data = [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    ingredient_data.push({
      "ingredient": row.getElementsByClassName("select_item")[0].value,
    });
  }
  json_data["ingredients"] = ingredient_data;
  console.log(json_data);
  return JSON.stringify(json_data);
}

function displayData() {
  var json_data = {};
  json_data["product"] = document.getElementById("product").value;
  json_data["unit"] = document.getElementById("product_unit").value;

  var rows = document.getElementsByClassName('table_row');
  var ingredient_data = [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    ingredient_data.push({
      "ingredient": row.getElementsByClassName("select_item")[0].value,
    });
  }
  json_data["ingredients"] = ingredient_data;
  return(json_data);
}

function delete_row(del_button) {
  $(del_button).closest('tr').remove();
}

function add_row() {
  var $table = $('#table');
  var $row = $('#table_row');
  var $rowClone = $row.clone(); // Clone table row
  $rowClone.find('input').val(""); // Remove values of inputs in cloned row
  $table.append($rowClone); // Append row to table
  $('td').last().after('<td> <button class="delete_button" type="button"> - </button></td>');
}

function openModal() {
  var modal = document.getElementById('modal');
  modal.style.display = 'block';
}

function closeModal() {
  var modal = document.getElementById('modal');
  modal.style.display = 'none';
}

$(document).ready(function() {

  populateIngredientDropdown();

//Open and close modal(form)
  var openButton = document.getElementById('open_form');
  openButton.addEventListener('click', openModal);

  var closeButton = document.getElementById('close_form');
  closeButton.addEventListener('click', closeModal);

//.on applies to dynamically added content
  $('table').on('click','.add_button',function(){
    add_row();
  });

  $('table').on('click','.delete_button',function(){
    delete_row(this);
  });

  $("#submit_button").click(function(e){
    e.preventDefault();
    var xhr = createCORSRequest('POST', base_url + '/api/recipe');
    xhr.setRequestHeader("Content-Type", "text/plain;");
    xhr.send(getFormData());
  });

  $("#submit_button").click(function(e){
    e.preventDefault();
    var test = displayData();
    var p = document.getElementById('JSON');
    p.innerHTML = test;
  });

  $('#form_reset_button').click(function(){
  if(confirm("Are you sure you want to clear the form?"))
    $('input').val('')
    $('option').val('')
  });

});
