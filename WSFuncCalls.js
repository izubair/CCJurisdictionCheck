var jurisdictionList;
var map;
var geocoder;
var marker = null;
var pin_marker = null;

var infowindow = null;

// A function to create the marker and set up the event window function  
 function createMarker(latlng, name, html) {  
 var contentString = html; 
 var iconBase = ''; 
 var lv_marker = new google.maps.Marker({  
 position: latlng, 
// icon: {
//            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
//            scale: 5
//          }, 
 icon: iconBase + 'orangearrow.png',
	
 map: map,  
 zIndex: Math.round(latlng.lat()*-100000)<<5  
 });  
  
 google.maps.event.addListener(lv_marker, 'click', function() {  
 infowindow.setContent(contentString);  
 infowindow.open(map,lv_marker);  
 });  
 google.maps.event.trigger(lv_marker, 'click');  
 return lv_marker;  
 }  

function initMap() {
		map = new google.maps.Map(document.getElementById('map-container'), {
			zoom: 16,
			center: {lat: 36.397, lng: -115.644}
		});
		
		infowindow = new google.maps.InfoWindow(
			{
				size: new google.maps.Size(150, 50)
			}
		);
		
		// Get the element with id="defaultOpen" and click on it
		document.getElementById("defaultOpen").click();
		
		
		document.getElementById("InputAddressText").value = "7300 Patrick Lane, Las Vegas";
		var addressParam = document.getElementById("InputAddressText").value
		geocoder = new google.maps.Geocoder();   
		geocodeAddressToMap(geocoder, map, addressParam);
		jurisdictionList = ["CC Bunkerville", "CC Enterprise","CC Goodsprings","CC Indian Springs","CC Laughlin","CC Lone Mountain","CC Lower Kyle Canyon","CC Moapa","CC Moapa Valley","CC Mt. Charleston","CC Mtn. Springs","CC Nellis AFB","CC Paradise","CC Redrock","CC Sandy Valley","CC Searchlight","CC Spring Valley","CC Summerlin South","CC Sunrise Manor","CC Unincorporated","CC Whitney","CC Winchester"];

		google.maps.event.addListener(map, 'click', function() {  
		infowindow.close();  
		});  

		google.maps.event.addListener(map, 'click', function(event) {  
			var coords = {X:0,Y:0};
			GetStatePlaneCoord(event.latLng.lat(), event.latLng.lng(), coords);
			//Check if within CC Jurisdiction
			var jurisObj = {juris: ""};
			GetJurisdication(coords.X, coords.Y, jurisObj);
			if( jurisdictionList.indexOf(jurisObj.juris) > -1 ) {		
					//call function to create marker  
					//if (pin_marker) {  
					//pin_marker.setMap(null);  
					//pin_marker = null;  
					//}
					var parcelNoObj = {parcel: ""};
					PointToParcel(coords.X, coords.Y, parcelNoObj);
					//document.getElementById("Result2Text").value = "Lat: " + event.latLng.lat() + "\nLon: " + event.latLng.lng() + "\nParcel: " + parcelNoObj.parcel; 
					$('#Result2Text').html("<b>" + "Latitude: " + "</b>" + event.latLng.lat() + "<br /><b>Longitude: </b>" + event.latLng.lng() + "<br /><b>Parcel: </b>" + parcelNoObj.parcel);
					
					var addrObj = {addr: ""};
					geocodeLatLngToAddress(event.latLng.lat(), event.latLng.lng(), addrObj);
					//pin_marker = createMarker(event.latLng, "name", "<b>Location</b><br>"+addrObj.addr); 
			}
			else
			{
				alert("This location is not within Clark County Jurisdiction");
			}
		}); 	
			
}
			
function geocodeAddressToMap(geocoder, resultsMap, addr) {
        //var address = document.getElementById('address').value;
				
				//var address = document.getElementById("InputAddressText").value
				
        geocoder.geocode({'address': addr}, function(results, status) {
          if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
						if(marker == null)
						{
							marker = new google.maps.Marker({
								map: resultsMap,
								position: results[0].geometry.location
							});
						}
						else{
							marker.setPosition(results[0].geometry.location); 
						}
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }
			
function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
		if(tabName === "ParcelToAddress")
		{
			document.getElementById("ParcelText").focus();
		}
		else
		{
			document.getElementById("InputAddressText").focus();
		}
}





function GetStatePlaneCoord(lat, lon, coords){
	var dataStr = 'inSR=4326&outSR=3421&geometries=' + lon + '%2C' + lat + '&transformation=&transformForward=false&f=pjson';			
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/arcgis/rest/services/Utilities/Geometry/GeometryServer/project",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {		   
		//alert( "The request is complete! x: " + json.geometries[0].x + "y: " + json.geometries[0].y);														
		coords.X = json.geometries[0].x;
		coords.Y = json.geometries[0].y;
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
};
function ParcelToPoint(parcelNo, coords)
{
	var dataStr = 'outputSpatialReferenceWkid=3421&parcel=' + parcelNo; 
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/gismo/webservice/GISDataWCF/GISDataService.svc/jsonep/ParcelToPoint",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {
		//alert( "The request is complete!" + json.jurisdiction);	
		
		if(json.xCoordinate == null)
		{
			coords.X = '0';
		  coords.Y = '0';
		}
		else
		{	
			coords.X = json.xCoordinate;
		  coords.Y = json.yCoordinate;
		}
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
}

function PointToParcel(x, y, parcelNoObj)
{
	var dataStr = 'xCoordinate=' + x + '&yCoordinate=' + y;
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/gismo/webservice/GISDataWCF/GISDataService.svc/jsonep/PointToParcel",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {
		//alert( "The request is complete!" + json.jurisdiction);	
		
		if(json.parcel == null)
		{
			parcelNoObj.parcel = "";
		}
		else
		{	
			parcelNoObj.parcel = json.parcel;
		}
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
}

function LatLonFromCoords(x, y, LatLonObj)
{
	var dataStr = 'InputWkid=3421&outWkid=4326&xCoordinate=' + x + '&yCoordinate=' + y;
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/gismo/webservice/GISDataWCF/GISDataService.svc/jsonep/ProjectPoint",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {
		//alert( "The request is complete!" + json.jurisdiction);	
		
		if(json.xCoordinate == null)
		{
			LatLonObj.lat = "";
			LatLonObj.lon = "";
		}
		else
		{	
			LatLonObj.lat = json.yCoordinate;
			LatLonObj.lon = json.xCoordinate;
		}
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
}

function GetJurisdication(x, y, jurObj)
{
	var dataStr = 'xCoordinate=' + x + '&yCoordinate=' + y + '&inputWKID= '; 
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/gismo/webservice/GISDataWCF/GISDataService.svc/jsonep/GetJurisdication",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {
		//alert( "The request is complete!" + json.jurisdiction);	
		
		if(json.jurisdiction == null)
			jurObj.juris = "Unknown";
		else
			jurObj.juris = json.jurisdiction;																
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
};
	
function GetStatePlaneCoordAndJurisd(lat, lon){
	var dataStr = 'inSR=4326&outSR=3421&geometries=' + lon + '%2C' + lat + '&transformation=&transformForward=false&f=pjson';			
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/arcgis/rest/services/Utilities/Geometry/GeometryServer/project",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {		   
		//alert( "The request is complete! x: " + json.geometries[0].x + "y: " + json.geometries[0].y);							
		GetJurisdicationFromCoords(json.geometries[0].x, json.geometries[0].y, lat, lon);					 
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
};

function GetAddressFromGoogle(lat, lon, addressObj)
{
	var dataStr = "latlng=" + lat + "," + lon + "&key=" + APIKey; 
	var APIKey = "AIzaSyAxd-A5zjspi0czQ9JcBTN8W2xye2Zj6xI"; 
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "https://maps.googleapis.com/maps/api/geocode/json" + dataStr,
		async: false,
		// The data to send 
		//data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {
		//alert( "The request is complete!" + json.jurisdiction);	
		
		if(json.jurisdiction == null)
			addressObj.addr = "Unknown";
		else
			addressObj.addr = formatted_address;																
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
};

function geocodeLatLngToAddress(lat, lon, addressObj) {
	var geocoder = new google.maps.Geocoder;  
  var latlng = {lat: parseFloat(lat), lng: parseFloat(lon)};
  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        //map.setZoom(11);
        //var marker = new google.maps.Marker({
        //  position: latlng,
        //  map: map
        //});
        addressObj.addr = results[0].formatted_address;
				
				document.getElementById("InputAddressText").value = addressObj.addr;					
				
				if (pin_marker) {  
					pin_marker.setMap(null);  
					pin_marker = null;  
					}
				pin_marker = createMarker(results[0].geometry.location, "name", "<b>Location</b><br>"+addressObj.addr); 
				// Force to show tab AddressToParcel, which shows the parcel for the clicked location 
				document.getElementById("tabAddressToParcel").click();
				//geocodeAddressToMap(geocoder, map, addressObj.addr);
				//map.setZoom(16);
        
      } else {
        addressObj.addr = 'No results found';
				
      }
    } else {
      addressObj.addr = 'Geocoder failed due to: ' + status;
			
    }
  });
}

function geocodeLatLng(lat, lon, addressObj) {
	var geocoder = new google.maps.Geocoder;  
  var latlng = {lat: parseFloat(lat), lng: parseFloat(lon)};
  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        //map.setZoom(11);
        //var marker = new google.maps.Marker({
        //  position: latlng,
        //  map: map
        //});
        addressObj.addr = results[0].formatted_address;
				
				//document.getElementById("ResultText").value = document.getElementById("ResultText").value + "\nAddress: " + addressObj.addr;
				$('#ResultText').html($('#ResultText').html() + "<br /><b>Address: </b>" + addressObj.addr);
				
				geocodeAddressToMap(geocoder, map, addressObj.addr);
				map.setZoom(16);
        
      } else {
        addressObj.addr = 'No results found';
				$('#ResultText').html($('#ResultText').html() + "<br /><b>Address: </b>" + addressObj.addr);
      }
    } else {
      addressObj.addr = 'Geocoder failed due to: ' + status;
			//document.getElementById("ResultText").value = document.getElementById("ResultText").value + "\nAddress: " + addressObj.addr;
			$('#ResultText').html($('#ResultText').html() + "<br /><b>Address: </b>" + addressObj.addr);
    }
  });
}

function geocodeAddress(address, resultObj) {
	var geocoder = new google.maps.Geocoder;  
	
	geocoder.geocode({'address': address}, function(results, status) {
		if (status === 'OK') {
			//resultsMap.setCenter(results[0].geometry.location);
			//var marker = new google.maps.Marker({
			//	map: resultsMap,
			//	position: results[0].geometry.location
			//});
			resultObj.lat = results[0].geometry.location.lat();
			resultObj.lon = results[0].geometry.location.lng();	
			
			var coords = {X:0,Y:0};
			GetStatePlaneCoord(resultObj.lat, resultObj.lon, coords);
			//Check if within CC Jurisdiction
			var jurisObj = {juris: ""};
			GetJurisdication(coords.X, coords.Y, jurisObj);
			if( jurisdictionList.indexOf(jurisObj.juris) > -1 ) { 
				var parcelNoObj = {parcel: ""};
				PointToParcel(coords.X, coords.Y, parcelNoObj);
				//document.getElementById("Result2Text").value = "<b>" + "Latitude: " + "</b>" + resultObj.lat + "\nLongitude: " + resultObj.lon + "\nParcel: " + parcelNoObj.parcel; 
				$('#Result2Text').html("<b>" + "Latitude: " + "</b>" + resultObj.lat + "<br /><b>Longitude: </b>" + resultObj.lon + "<br /><b>Parcel: </b>" + parcelNoObj.parcel);

				geocodeAddressToMap(geocoder, map, address);
				map.setZoom(16);
			}
			else{
				$('#Result2Text').html("Latitude: " + resultObj.lat + "\nLongitude: " + resultObj.lon + "\nAddress: " + address + " is within " + jurisObj.juris);
			}
		} 
		else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}

function GetAddress()
{
	var parcelno = document.getElementById("ParcelText").value;
	var coords = {X:0,Y:0};
	var latlonObj = {lat:0,lon:0};
	var jurisObj = {juris: ""};
	//Get point from parcel
	ParcelToPoint(parcelno, coords);
	//Check if within CC Jurisdiction
	GetJurisdication(coords.X, coords.Y, jurisObj);
	if( jurisdictionList.indexOf(jurisObj.juris) > -1 ) { 

		// Convert state plane coordinates to lat, lon	
		LatLonFromCoords(coords.X, coords.Y, latlonObj);
		// Get address
		var addrObj = {addr: ""};
		geocodeLatLng(latlonObj.lat, latlonObj.lon, addrObj);
		//GetAddressFromGoogle(latlonObj.lat, latlonObj.lon, addrObj);
		// display result
		//document.getElementById("ResultText").value = "X: " + coords.X + "\nY: " + coords.Y + "\nLatitude: " + latlonObj.lat + "\nLongitude: " + latlonObj.lon; 
		$('#ResultText').html("<b>X: </b>" + coords.X + "<br /><b>Y: </b>" + coords.Y + "<br /><b>Latitude: </b>" + latlonObj.lat + "<br /><b>Longitude: </b>" + latlonObj.lon);
	}
	else{
			$('#ResultText').html("ParcelNo: " + parcelno + " is within " + jurisObj.juris);		
	}
}

function GetParcel()
{
	var address = document.getElementById("InputAddressText").value;		
	var resultObj = {lat:0,lon:0};
	geocodeAddress(address, resultObj);
	
}




				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				