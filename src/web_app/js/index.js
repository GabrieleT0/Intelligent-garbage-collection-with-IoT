//Call the RESTApi to fetch the last measurements
async function getIoTData(){
    const response = await fetch("http://localhost:4566/restapis/2nw5nxfrqu/test/_user_request_/test")
    const jsonData = await response.json();

    return jsonData
}

async function getAddress(lat,lon){
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
    const jsonData = await response.json();

    return jsonData
}

function drawRoute(waypoints){
    //Waypoints is an array of elements like this: L.latLng(lat, long)
    L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true
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
                iconAnchor:   [22, 94],
                shadowAnchor: [4, 62],
                popupAnchor:  [-3, -76]
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
}

