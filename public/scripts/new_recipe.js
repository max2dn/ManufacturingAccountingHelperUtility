function populateIngredientDropdown() {
  var xhr = createCORSRequest('GET', base_url + '/rawitems');
  xhr.send();
  var product_dropdown = document.getElementById("select_ingredient_dropdown");
  var json_data = JSON.parse(xhr.response);
  for (var i = 0; i < json_data.length; i++) {
    var option_item = document.createElement("option");
    option_item.text = json_data[i]["item_name"];
    option_item.value = json_data[i]["item_name"];
    product_dropdown.add(option_item);
  };
}

function getFormData(){
  var json_data = {};
  json_data["product"] = document.getElementById("product").value;
  json_data["unit"] = document.getElementById("product_unit").value;

  if (document.querySelector('.type:checked') == null){
    return null;
  }

  json_data["category"] = document.querySelector('.type:checked').value;
  var rows = document.getElementsByClassName('table_row');
  var ingredient_data = [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    ingredient_data.push({
      "ingredient": row.getElementsByClassName("select_item")[0].value,
    });
  }
  if(hasDuplicates(Object.values(ingredient_data)))
    return "duplicate";

  json_data["ingredients"] = ingredient_data;
  if(hasBlanks(json_data)){
    return null;
  }
  return JSON.stringify(json_data);
}

function delete_row(del_button) {
  $(del_button).closest('tr').remove();
}

function add_row() {
  var $table = $('#ingredient_table');
  var $row = $('#table_row');
  var $rowClone = $row.clone(); // Clone table row
  $rowClone.find('input').val(""); // Remove values of inputs in cloned row
  $table.append($rowClone); // Append row to table
  $table.find('td').last().after('<td> <button class="delete_button" type="button"> - </button></td>');
}

function closeModal() {
  $('#recipe_form')[0].reset();
  $('#new_recipe').remove();
}
// Start of Functions

populateIngredientDropdown();

$('.close_form').on('click', function(){
  closeModal();
});

$('table').on('click', '.add', function() {
  add_row();
});

$('table').on('click', '.delete_button', function() {
  delete_row(this);
});

$("#submit_button").click(function(event) {
  event.preventDefault();
  var xhr = createCORSRequest('POST', base_url + '/recipe');
  xhr.setRequestHeader("Content-Type", "text/plain;");
  var form_data=getFormData();
  if(form_data === null){
    alert("Hey Felicia: All Fields Must Be Filled In");
    return;
  }
  else if(form_data === "duplicate"){
    alert("Hey Felicia: Please Remove Duplicate Items");
    return
  }
  xhr.send(form_data);
  var json_data = JSON.parse(xhr.response);
  location.reload();
});
