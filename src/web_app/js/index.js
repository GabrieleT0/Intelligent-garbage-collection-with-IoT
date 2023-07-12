//Call the RESTApi to fetch the last measurements
async function getIoTData(){
    const response = await fetch("http://localhost:4566/restapis/ab30x25pef/test/_user_request_/test")
    const jsonData = await response.json();

    return jsonData
}

async function getAddress(lat,lon){
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
    const jsonData = await response.json();

    return jsonData
}

async function getOptimizedRoute(locations){
    locations = JSON.stringify(locations)
    const response = await fetch(`http://localhost:8002/optimized_route?json=${locations}`)
    const jsonData = await response.json();

    return jsonData
}

function drawRoute(waypoints){
    //Waypoints is an array of elements like this: L.latLng(lat, long)
    L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        createMarker: function() {return null;} 
    }).addTo(map);
}

function createMap(){
    //Set the map center
    var map = L.map('map').setView([40.68252333266151, 14.770895359322255], 15);
    //Load IoT devices cordinates and create a marker on the map for each of them
    getIoTData().then(jsonData => {
        jsonData;
        var BinIcon = L.Icon.extend({
            options: {
                iconSize:     [45, 45],
                shadowSize:   [50, 64],
                //iconAnchor:   [22, 94],
                //shadowAnchor: [4, 62],
                popupAnchor:  [0, -18]
            }
        });
        //waypoints = []
        for(var i = 0; i < jsonData.length; i++){
            lat = jsonData[i].latitude
            long = jsonData[i].longitude
            if(jsonData[i].trash_level == 'EMPTY'){
                urlIcon = 'img/empty-bin.png'
                message = `<b>Sono vuoto!</b>`
            }
            else if(jsonData[i].trash_level == 'MEDIUM'){
                urlIcon = 'img/medium-bin.png'
                message = `<b>Sono pieno a metà!`
            }
            else if(jsonData[i].trash_level == 'HIGH'){
                urlIcon = 'img/almst-sull-bin.png'
                message = `<b>Sono quasi pieno!`
            }
            else if(jsonData[i].trash_level == 'TO BE EMPTIED'){
                urlIcon = 'img/full-bin.png'
                message = `<b>Sono pieno, vieni a prendermi!`
            }
            //waypoints.push(L.latLng(lat, long))
            var binIcon = new BinIcon({iconUrl: urlIcon})
            var marker = L.marker([lat, long],{icon: binIcon}).addTo(map);
            //Here we can personalize the popup on the marker when it is clicked
            marker.bindPopup(message);
        }
    })
    //Lastly, render the map
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    return map
}

function calculateRoute(map){
    getIoTData().then(jsonData => {
        jsonData;
        //Sort data based on the trash level (TO BE EMPTIED firts)
        jsonData.sort(compareTrashLevel);
        bins_position = []
        //Construct an array with only lat e long of every bins
        for(var i = 0; i < jsonData.length; i++){
            lat = jsonData[i].latitude
            long = jsonData[i].longitude
            if(jsonData[i].trash_level != 'EMPTY')
                bins_position.push({'lat':lat, "lon":long})
        }
        locations = {"locations":bins_position,"costing":"auto","directions_options":{"units":"miles"}}
        getOptimizedRoute(locations).then(route => {
            route;
            best_route = route.trip.locations;
            waypoints = []
            for(var i = 0; i< best_route.length; i++){
                waypoints.push(L.latLng(best_route[i].lat, best_route[i].lon))
            }
            drawRoute(waypoints)
        })
        
    });

    /* In this way we can get the marker directly from the map
    map.eachLayer(function (layer) { 
        if(layer._latlng)
            consoled.log(layer._latlng)
    });
    */
}

// Funzione di confronto per l'ordinamento in base a trash_level
function compareTrashLevel(a, b) {
  const levels = ['TO BE EMPTIED', 'HIGH', 'MEDIUM', 'LOW', 'EMPTY'];

  const levelA = levels.indexOf(a.trash_level);
  const levelB = levels.indexOf(b.trash_level);

  if (levelA < levelB) {
    return -1;
  }
  if (levelA > levelB) {
    return 1;
  }
  return 0;

}

document.addEventListener('DOMContentLoaded', () => {

    // Get all "navbar-burger" elements
    const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
  
    // Check if there are any navbar burgers
    if ($navbarBurgers.length > 0) {
  
      // Add a click event on each of them
      $navbarBurgers.forEach( el => {
        el.addEventListener('click', () => {
  
          // Get the target from the "data-target" attribute
          const target = el.dataset.target;
          const $target = document.getElementById(target);
  
          // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
          el.classList.toggle('is-active');
          $target.classList.toggle('is-active');
  
        });
      });
    }
  });