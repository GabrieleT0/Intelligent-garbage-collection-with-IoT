document.addEventListener('DOMContentLoaded', () => {
    (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
      const $notification = $delete.parentNode;
  
      $delete.addEventListener('click', () => {
        $notification.parentNode.removeChild($notification);
      });
    });
  });

async function getOptimizedRoute(locations){
    locations = JSON.stringify(locations)
    const response = await fetch(`http://localhost:8002/optimized_route?json=${locations}`)
    const jsonData = await response.json();

    return jsonData
}

function drawRoute(waypoints,map){
    //Waypoints is an array of elements like this: L.latLng(lat, long)
    L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        createMarker: function() {return null;} 
    }).addTo(map);
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
            if(jsonData[i].trash_level != 'EMPTY' && jsonData[i].trash_level != 'LOW')
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

function createMap2(){
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
            else if(jsonData[i].trash_level == 'LOW'){
                urlIcon = 'img/low.png'
                message = `<b>Sono pieno, vieni a prendermi!`
            }
            //waypoints.push(L.latLng(lat, long))
            var binIcon = new BinIcon({iconUrl: urlIcon})
            var marker = L.marker([lat, long],{icon: binIcon}).addTo(map).on('click', change_starting_point);
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

function change_starting_point(e){
    lat_lng_clicked = e.latlng
    bins_position = []
    bins_position.push({'lat':e.latlng.lat, "lon":e.latlng.lng})
    getIoTData().then(jsonData => {
        jsonData;
        jsonData.sort(compareTrashLevel);
        for(var i = 0; i<jsonData.length; i++){
            lat = jsonData[i].latitude
            long = jsonData[i].longitude
            if(lat != e.latlng.lat && jsonData[i].trash_level != 'EMPTY' && jsonData[i].trash_level != 'LOW')
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
            /*
            map.eachLayer(function (layer) { 
                console.log(layer)
                if(layer._route)
                    map.removeLayer(layer)
            });
            */
            //TODO: improve this solution, maybe we can use the method for delete layer, insted of recreate the map (see on top). The problem are the instructions.
            map.remove()
            map = createMap2()
            drawRoute(waypoints,map)
        })
    });
}

function populate_dropdown(){
    var source = document.getElementById("source-selected");
    var destination = document.getElementById("destination-selected");
    getIoTData().then(jsonData => {
        jsonData;
        jsonData.sort(compareTrashLevel);
        for(var i = 0; i<jsonData.length; i++){
            (function(index){
                getAddress(jsonData[i].latitude,jsonData[i].longitude).then(address_response => {
                address = address_response.address
                var option_source = document.createElement("option")
                var option_destination = document.createElement("option")
                if(address.amenity)
                    option_source.text = `${address.amenity} ,${address.road}, ${address.city}`;                
                else
                    option_source.text = `${address.road}, ${address.city}`;
                //the id of the elements in the dropdown menù matches the id of the IoT devices.
                option_source.id = jsonData[index].device_id
                option_source.value = JSON.stringify({lat:jsonData[index].latitude, lon:jsonData[index].longitude})
                if(address.amenity)
                    option_destination.text = `${address.amenity} ,${address.road}, ${address.city}`;                
                else
                    option_destination.text = `${address.road}, ${address.city}`;
                option_destination.id = jsonData[index].device_id
                option_destination.value = JSON.stringify({lat:jsonData[index].latitude, lon:jsonData[index].longitude})
                
                source.add(option_source)
                destination.add(option_destination)
                })
            })(i)
        }
    })
}

function route_from_form(){
    var form = document.getElementById("personal_route")
    form.addEventListener("submit", function(event) {
        event.preventDefault(); 
        var source_selected = document.getElementById("source-selected")
        var destination_selected = document.getElementById("destination-selected")
        var check_empty = document.getElementById('empty-bins').checked
        var check_low = document.getElementById('low-bins').checked
        try{
            value_source_selected = JSON.parse(source_selected.value)
            value_destination_selected = JSON.parse(destination_selected.value)
        } catch (error){
            error_message = document.getElementById('error-route')
            if(error_message.style.display == 'none'){
                error_message.style.display = 'block'
            }
            return
        }
        error_message = document.getElementById('error-route')
        error_message.style.display = 'none'
        bins_position = []
        bins_position.push(value_source_selected)
        getIoTData().then(jsonData => {
            jsonData.sort(compareTrashLevel);
            for(var i = 0; i<jsonData.length; i++){
                lat = jsonData[i].latitude
                long = jsonData[i].longitude
                if(lat != value_destination_selected.lat && lat != value_source_selected.lat){
                    if(jsonData[i].trash_level == 'EMPTY' && check_empty == true)
                        continue
                    if (jsonData[i].trash_level == 'LOW' && check_low == true)
                        continue
                    bins_position.push({'lat':lat, "lon":long})
                }
            }
            bins_position.push(value_destination_selected) 
            locations = {"locations":bins_position,"costing":"auto","directions_options":{"units":"miles"}}
            getOptimizedRoute(locations).then(route => {
                route;
                best_route = route.trip.locations;
                waypoints = []
                for(var i = 0; i< best_route.length; i++){
                    waypoints.push(L.latLng(best_route[i].lat, best_route[i].lon))
                }
                //TODO: improve this solution, maybe we can use the method for delete layer, insted of recreate the map (see on top). The problem are the instructions.
                map.remove()
                map = createMap2()
                drawRoute(waypoints,map)
            })
        })
        hide_form()
    })
}

function hide_form(){
    var form = document.getElementById("form-div")
    if(form.style.display == 'none'){
        form.style.display = 'block'
    } else {
        form.style.display = "none"
    }
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