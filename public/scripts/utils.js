var base_url = window.location.origin

function createCORSRequest(method, url){
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, false);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

function hasBlanks(json_object){
  var jsonString = JSON.stringify(json_object);
  return jsonString.includes('""');
}

function hasDuplicates(array) {
  var seen = {};
  for(i=0; i<array.length; i++){
    item = array[i].ingredient;
    if(seen.hasOwnProperty(item)){
      return true;
    }
    seen[item] = true;
  }
  return false;
}


var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  })
