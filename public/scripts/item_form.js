$(document).ready(function() {

  $("button").click(function() {
    $('#item_table').append('<tr>' + '</tr>');
    $itemValue = $('#item').val();
    $('tr:last').append('<td>' + $itemValue + '</td>')
    $lastCost = $('#last_cost').val();
    $('tr:last').append('<td>' + '$' + $lastCost + '</td>')
    $selectedUnit = $('#unit option:selected').text();
    $('tr:last').append('<td>' + $selectedUnit + '</td>')
    console.log()


  });

});


/*
$itemValue = $('#item').val();
$('tr:last').append('<td>' + $itemValue + '</td>')
$lastCost = $('#last_cost').val();
$('tr:last').append('<td>' + '$' + $lastCost + '</td>')
$selectedUnit = $('#unit option:selected').text();
$('tr:last').append('<td>' + $selectedUnit + '</td>')
console.log()
*/
