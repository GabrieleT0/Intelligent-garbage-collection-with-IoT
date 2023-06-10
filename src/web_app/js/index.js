//Call the RESTApi to fetch the last measurements
async function getIoTData(){
    const response = await fetch("http://localhost:4566/restapis/czm2gpf1uf/test/_user_request_/test")
    const jsonData = await response.json();

    return jsonData
}

function createMap(){
    var map = L.map('map').setView([40.68252333266151, 14.770895359322255], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
}

getIoTData().then(jsonData => {
    jsonData;
});
