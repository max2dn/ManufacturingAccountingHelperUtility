function openModal() {
  var modal = document.getElementById('new_recipe');
  modal.style.display = 'block';
}

function openEditModal(){
  var modal = document.getElementById('edit_recipe_modal');
  modal.style.display = 'block';
}

function displayProducts() {
  var xhr = createCORSRequest('GET', base_url + '/finishedgoods');
  xhr.send();
  var results = JSON.parse(xhr.response);
  for(i=0; i<results.length; i++){
    var div = $('<div class="item_block"></div>');
    var label = $('<p class="item_label"></p>');
    var editButton = '<button class="button edit" value="'+results[i].item_name+'" type="button"> <i class="material-icons create">create</i> </button>';
    var deleteButton = '<button class="button delete" value="'+results[i].item_name+'" type="button"><i class="material-icons trash">delete_outline</i></button>';
    label.text(results[i].item_name);
    div.attr('id', results[i].item_name);
    div.append(label, editButton, deleteButton);
    $('.flexbox').append(div);
  }
}

function checkNonConfiguredItems(){
  var xhr = createCORSRequest('GET', base_url + '/nonconfigureditems');
  xhr.send();
  var json_data = JSON.parse(xhr.response);

  if (json_data.length > 0){
    var items = ""
    for(var i=0;i<json_data.length;i++){
      items = items + json_data[i].item_name + ", ";
    };
    var notificationBox = $('#notification');
    var notification = "<p id=message>"+"Please input the recipe for the following items:<br />" + items + "</p>";
    notification.className="message";
    notificationBox.append(notification);
    notificationBox.show();
    //alert("Please input the recipe for the following items:\n" + items)
  }
}

$(document).ready(function() {

  $('#navigation').load('/modules/navigation_menu.html');
  checkNonConfiguredItems();

  displayProducts();

  $('#open_form').on('click', function() {
    $('#new_recipe_form').load('/modules/new_recipe.html', function() {
      $.getScript('/scripts/new_recipe.js');
      openModal();
    });
  });

  $('.edit').on('click', function() {
    window.clicked_item = this.value;
    $('#edit_recipe_form').load('/modules/edit_recipe_form.html', function() {
      $.getScript('/scripts/edit_recipe.js');
      openEditModal();
    });
  });

  $('.delete').on('click', function() {
    if(confirm("Are you sure you want to delete " + this.value + "?")){
      var xhr = createCORSRequest('DELETE', base_url + '/recipe?product='+this.value);
      xhr.send();
      location.reload();
    }
  });
});