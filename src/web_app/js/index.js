//Call the RESTApi to fetch the last measurements
async function getIoTData(){
    const response = await fetch("http://localhost:4566/restapis/czm2gpf1uf/test/_user_request_/test")
    const jsonData = await response.json();

    return jsonData
}

function createMap(){
    //Set the map center
    var map = L.map('map').setView([40.68252333266151, 14.770895359322255], 15);
    //Load IoT devices cordinates and create a marker on the map for each of them
    getIoTData().then(jsonData => {
        jsonData;
        for(var i = 0; i < jsonData.length; i++){
            lat = jsonData[i].latitude
            long = jsonData[i].longitude
            var greenIcon = L.icon({
                iconUrl: 'img/medium.png',
                iconSize:     [30, 40], // size of the icon
                shadowSize:   [50, 64], // size of the shadow
                iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
                shadowAnchor: [4, 62],  // the same for the shadow
                popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
            });
            var marker = L.marker([lat, long],{icon: greenIcon}).addTo(map);
            //Here we can personalize the popup on the marker when it is clicked
            marker.bindPopup("<b>Ciao, sono un bidone!</b><br>Qui puoi inserire quanto sono pieno.");
        }
    });
    //Lastly, render the map
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}

