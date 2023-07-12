// Create urlParams query string
function create_map(){
    var urlParams = new URLSearchParams(window.location.search);
    var lat = urlParams.get("lat");
    var long = urlParams.get("lon");
    var id_sensor = urlParams.get("id");

    //Set the map center
    var map = L.map('map').setView([lat, long],18);
    var BinIcon = L.Icon.extend({
        options: {
            iconSize:     [60, 60],
            shadowSize:   [50, 64],
            //iconAnchor:   [22, 94],
            //shadowAnchor: [4, 62],
            popupAnchor:  [0, -18]
        }
    });
    urlIcon = 'img/lights.png'
    var binIcon = new BinIcon({iconUrl: urlIcon})
    var marker = L.marker([lat, long],{icon: binIcon}).addTo(map);
    //Here we can personalize the popup on the marker when it is clicked
    address = getAddress(lat,long)
    getAddress(lat,long).then(address_data => {
        address = address_data.display_name
        message = `<b>Device ID: ${id_sensor}</b> <br> <p>${address}</p>`
        marker.bindPopup(message);
        //Lastly, render the map
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        return map
    })
}