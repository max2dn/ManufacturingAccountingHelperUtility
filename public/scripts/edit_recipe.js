function getRecipe() {
  var xhr = createCORSRequest('GET', base_url + '/api/recipe?product=' + window.clicked_item);
  xhr.send();
  var result = JSON.parse(xhr.response);
  $('#product').text(result.product);
  $('#product_unit').text(result.unit);
  if(result.category == "fishcake")
    document.getElementById("fishcake_radio").checked = true;
  else {
    document.getElementById("non-fishcake_radio").checked = true;
  }
  for (var i = 0; i < result.ingredients.length; i++) {
    var tableRow = $('<tr></tr>').addClass('table_row');
    var listElement = $('<td>' + result.ingredients[i].ingredient + '</td>').addClass('existing');
    var deleteButton = '<td class="delete_td"> <i class="material-icons delete_button"> remove_circle_outline </i> </td>';
    tableRow.append(listElement, deleteButton);
    $('#ingredient_table').append(tableRow);
  };
}

function addIngredient(){
    var tableRow = $('<tr></tr>').addClass('table_row');
    var tableData = $('<td></td>').addClass('ingredient');
    var ingredient_dropdown = $('<select></select>').addClass('select_item');
    var deleteButton = '<td class="delete_td"> <i class="material-icons delete_button"> remove_circle_outline </i></td>';

    var xhr = createCORSRequest('GET', base_url + '/api/items/raw');
    xhr.send();
    var json_data = JSON.parse(xhr.response);
    for (var i = 0; i < json_data.length; i++) {
      var option_item = document.createElement("option");
      option_item.text = json_data[i]["item_name"];
      option_item.value = json_data[i]["item_name"];
      ingredient_dropdown.append(option_item);
    };
    tableData.append(ingredient_dropdown);
    tableRow.append(tableData,deleteButton);
    $('#ingredient_table').append(tableRow);
}

function getFormData() {
  var json_data = {};
  json_data["product"] = document.getElementById("product").innerText;
  json_data["unit"] = document.getElementById("product_unit").value;
  json_data["category"] = document.querySelector('input[name=item_type]:checked').value;
  var existing_ingredients = document.getElementsByClassName("existing")
  var new_ingredients = document.getElementsByClassName("select_item")
  var ingredient_data = [];
  for (var i = 0; i < existing_ingredients.length; i++) {
    ingredient_data.push({
      "ingredient": existing_ingredients[i].innerHTML,
    });
  }
  for (var i = 0; i < new_ingredients.length; i++) {
    if (new_ingredients[i].value != ''){
      ingredient_data.push({
        "ingredient": new_ingredients[i].value,
      });
    }
  }
  if(hasDuplicates(Object.values(ingredient_data)))
    return "duplicate";

  json_data["ingredients"] = ingredient_data;

  if(hasBlanks(json_data)|| ingredient_data.length<1){
    return null;
  }
  return JSON.stringify(json_data);
}

function delete_row(del_button) {
  $(del_button).closest('tr').remove();
}

function closeModal() {
  $('#edit_form')[0].reset();
  $('#edit_recipe_modal').remove();
}

// Start of Functions

getRecipe();

$('#add_ingredient').on('click',function() {
  addIngredient();
});

$('#ingredient_table').on('click', '.delete_button', function() {
  delete_row(this);
});

$('#update_button').on('click', function(event) {
  var xhr = createCORSRequest('PUT', base_url + "/api/recipe");
  event.preventDefault();
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

$('#close_form').on('click',function(){
  closeModal();
})
