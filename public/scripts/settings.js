
$(document).ready(function(){

$('#navigation').load('/modules/navigation_menu.html');
var xhr = createCORSRequest('GET', base_url + '/config');
xhr.send();
var settings = JSON.parse(xhr.response);

for (i=0; i<settings.length;i++) {
  var field = settings[i].config_key;
  var config = document.getElementById(field);
  if(config)
    config.value = settings[i].config_value;
}

// Edit button event listener
$('.edit').on('click',function(e){
  e.preventDefault();
  $(this).hide();
  $(this).next().show();
  var input = $(this).siblings('input');
  input.removeAttr('readonly');
  input.addClass('active');
});

// Save button event listener
$('.save').on('click',function(e){
  e.preventDefault();
  $(this).hide();
  $(this).prev().show();
  var input = $(this).siblings('input');
  input.attr('readonly','readonly');
  input.removeClass('active');
  var query = "?" + input[0].id + "=" + input[0].value;
  var xhr = createCORSRequest('PUT', base_url + '/config' + query);
  xhr.send();
  if(xhr.status!=200){
    alert(xhr.statusText)
  }
});

// Send new configurations

})
