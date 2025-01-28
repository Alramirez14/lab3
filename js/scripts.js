   // Initialize the map
   var map = L.map('dotmap', {
    crs: L.CRS.EPSG3857 
   }).setView([44.7,-119.6], 6); // Center of the map at these coordinates with zoom level 13

   // Add a tile layer (this is OpenStreetMap tiles)
   L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
   }).addTo(map);


   function createPropSymbols(data){
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        crs: L.CRS.EPSG3857,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};


   fetch('data/test3.geojson')
   .then(response => response.json())
   .then(data => {
       // Add the GeoJSON to the map
       createPropSymbols(data);
       console.log(data.features.length)
   })
   .catch(error => {
       console.error("Error loading GeoJSON: ", error);
   });


// //Step 2: Import GeoJSON data
// function getData(){
//     //load the data
//     fetch("data/airports.geojson")
//         .then(function(response){
//             return response.json();
//         })
//         .then(function(json){
//             //call function to create proportional symbols
//             createPropSymbols(json);
//             console.log(data.features.length);
//         })
// };