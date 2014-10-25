var geocoder;
var map;
var infowindow;
var directionsService;
var directionsDisplay;
var markerArray = [];
var tempArray = [];
var googleLA;
var infowindow;

function initialize() {
  markerArray = [];
	var googleLA = new google.maps.LatLng(33.9932708, -118.4805455);
	var infowindow = new google.maps.InfoWindow();
	var initialLocation = googleLA;
  var mapOptions = {
    center: new google.maps.LatLng(33.9932708, -118.4805455),
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
	};

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    // Try W3C Geolocation (Preferred)
	if(navigator.geolocation) {
	    browserSupportFlag = true;
	    navigator.geolocation.getCurrentPosition(function(position) {
	      initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
	      console.log(initialLocation);
	      map.setCenter(initialLocation);
	    }, function() {
	      handleNoGeolocation(browserSupportFlag);
	    });
	}
	// Browser doesn't support Geolocation
	else {
		browserSupportFlag = false;
	    handleNoGeolocation(browserSupportFlag);
	}

  var marker = new google.maps.Marker({
      position: initialLocation,
      map: map,
      title:"Current Location"
  });
  markerArray.push(marker);

    console.log(initialLocation);
  
  if($("#searchValue").val() !==""){
    $.ajax({
      type: 'GET',
      url: '/get_search_params/'+$("#searchValue").val()+'/'+initialLocation.k+'/'+initialLocation.B,
      dataType: 'json',
      success: function(response) {
          var res = JSON.parse(response);
          var res =  res.businesses;
          for(var i = 0; i < res.length;i++){
            var name = res[i].name;
            var coord = res[i].coordinate;
            var lon = coord.longitude;
            var lat = coord.latitude;
            var address = res[i].location.display_address;
            var phone = res[i].display_phone;
             marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lon),
                map: map,
                title: name
              });
              markerArray.push(marker);
          }
          
          alert("worked");
   
   
      },
      error: function(x,y,z) {
          alert(x.responseText);
      }
    });
  }
  
  if($("#searchValue").val() ===""){

    marker = new google.maps.Marker({
      position: new google.maps.LatLng(33.9932708, -118.45),
      map: map,
      title:"PetSmart"
    });
    markerArray.push(marker);

    marker = new google.maps.Marker({
      position: new google.maps.LatLng(34.0, -118.46),
      map: map,
      title:"BestBuy"
    });
    markerArray.push(marker);

    marker = new google.maps.Marker({
      position: new google.maps.LatLng(34.0, -118.4805455),
      map: map,
      title:"YMCA",
    });
    markerArray.push(marker);
  }
  else if($("#searchValue").val() ==="pets"){
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(33.9932708, -118.45),
      map: map,
      title:"PetSmart"
    });
    markerArray.push(marker);
  }
  else if($("#searchValue").val() ==="best buy"){
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(34.0, -118.46),
      map: map,
      title:"BestBuy"
    });
    markerArray.push(marker);
  }
  else{
    ;
  }

  var rendererOptions = {
    map: map
  }
  directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
  directionsService = new google.maps.DirectionsService();

  for(var i = 0; i < markerArray.length; i++){
    var infowindow = new google.maps.InfoWindow({
        content: '<img name="'+markerArray[i].title+'"" lat="'+markerArray[i].position.k+'"" long="'+markerArray[i].position.B+'" class="addMarker" src="img/plus.png"><h2>Click to add '+markerArray[i].title+'!</h2>',
        backgroundColor: '#128c16'
      });
    bindOpenWindow(infowindow, map, markerArray[i]);    
  }
  
}

function calcRoute() {
  $("#route").addClass("newSearch");
  $("#route").removeClass("route");
  $("#route").val("New Search");

  for (i = 0; i < tempArray.length; i++) {
    tempArray[i].setMap(null);
  }
  tempArray=[];

  $("#list").children().each(function () {
      var value = $(this).children("li");
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(value.attr("lat"), value.attr("long")),
        map: map,
      });
      tempArray.push(marker);
  });

  clearMarkers(markerArray);
  console.log(tempArray);
  var waypoints = [];
  for(var i = 1; i < tempArray.length-1; i++){
    waypoints.push({
          location: new google.maps.LatLng(tempArray[i].position.k, tempArray[i].position.B),
          stopover:true
      });
  }

  var request = {
      origin: new google.maps.LatLng(tempArray[0].position.k, tempArray[0].position.B),
      destination: new google.maps.LatLng(tempArray[tempArray.length-1].position.k, tempArray[tempArray.length-1].position.B),
      waypoints: waypoints, 
      travelMode: google.maps.TravelMode.DRIVING
  };

  // Route the directions and pass the response to a
  // function to create markers for each step.
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
      var duration=0;
      for(var i = 0; i < response.routes[0].legs.length; i++){
        duration += response.routes[0].legs[i].duration.value;
        console.log(response.routes[0].legs[i].duration.text);
      }
      console.log(Math.round(duration*0.0166667)+ " minutes.");
      $("#estimatedTime").html("Total estimated time: "+Math.round(duration*0.0166667)+" minutes.");
      $("#estimatedTime").css("visibility","visible");
    }
  });
}

function handleNoGeolocation(errorFlag) {
	if (errorFlag == true) {
	  alert("Geolocation service failed.");
	  initialLocation = googleLA;
	} else {
	  alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
	  initialLocation = googleLA;
	}
	map.setCenter(initialLocation);
}

$(document).ready(function() {
	initialize();
  $(document).on('click', ".route", calcRoute);
  $(document).on('click', ".addMarker", echoJunk);
  $(document).on('click', ".newSearch", startNewSearch);
  $(document).on('click', "#enter", initialize);
  $(document).on('click', ".cross", removeItem);
});



function bindOpenWindow(infowindow, map, marker)
{
    google.maps.event.addListener(marker, 'click', function() {infowindow.open(map, marker);});
}


function setAllMap(map, array) {
  for (var i = 0; i < array.length; i++) {
    array[i].setMap(map);
  }
}

function clearMarkers(array) {
  setAllMap(null, array);
}

// Shows any markers currently in the array.
function showMarkers(array) {
  setAllMap(map, array);
}

function deleteMarkers(array) {
  clearMarkers(array);
  array = [];
}

function echoJunk(){
  $("#list").append("<div><img class='cross' src='img/cross.png'><li lat='"+$(this).attr("lat")+"' long='"+$(this).attr("long")+"'>"+$(this).attr("name")+"</li></div>");
}

function startNewSearch(){
  $("#route").removeClass("newSearch");
  $("#route").addClass("route");
  $("#route").val("Route");
  $("#list").empty();
  $("#estimatedTime").css("visibility","hidden");
  deleteMarkers(tempArray);
  console.log(tempArray);
  initialize();


}

function removeItem(){
  $(this).parent().remove();
}