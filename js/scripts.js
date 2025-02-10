   // Initialize the map
   var map = L.map('dotmap', {
    crs: L.CRS.EPSG3857 
   }).setView([44.1,-120.5], 7); // Center of the map at these coordinates with zoom level 7

   // Add a tile layer (this is ESRI satellite tiles)
   L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
       attribution: '&copy; <a href="https://www.esri.com/en-us/legal/terms/data-attributions"> ESRI Satellite Imagery</a> contributors'
   }).addTo(map);

function calcPropRadius(attValue) { //this is an arbitrary function for radius based on aesthetics
    var radius = Math.sqrt(attValue)/6
    return radius;
}

function colorchooser(attValue) { //this selects color based on the attValue, I've binned them to best fit the data with nice intervals:
    if (attValue <= 1000) {
        return "#2ac129";
    }
    else if (attValue <= 1500) {
        return "#cbe808";
    }
    else if (attValue <= 2500){
        return "#e85808";
    }
    else {
        return "red";
    }
}


function createPropSymbols(data){ //this defines the generic symbol properties
    var geojsonMarkerOptions = {
        radius: 8,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    };
    

    var attribute = "Barrier_size_index" //sets up the symbol generation from attributes

    L.geoJson(data, { //defines how to add the geojson to the map 
        crs: L.CRS.EPSG3857,
        pointToLayer: function (feature, latlng) {
            var attValue = Number(feature.properties[attribute]); //defines the scaling field

            if (attValue == 0) { //added this to get rid of points with no data values
                return null;
            }
            console.log(feature.properties, attValue); //returns for debugging 
            geojsonMarkerOptions.radius = calcPropRadius(attValue); //calculates scaling radii
            geojsonMarkerOptions.fillColor = colorchooser(attValue);// picks the color
            geojsonMarkerOptions.zIndex = attValue; //this was an attempt to make larger markers appear in front of smaller ones -
            //it didn't work, but it didn't break anything so I left it in here to see if I can come back and make it work later. 

            var pointmarker = L.circleMarker(latlng, geojsonMarkerOptions); // Styles the point layer and georeferences it

            pointmarker.bindPopup("<strong>Fish Barrier Volume:</strong> " + attValue);//create the popup, no additional steps for the click type

            //puts the point down for the popups
            return pointmarker;

            //symbolizes the data
           
        }
    }).addTo(map); //adds the adds the data to the map
};

fetch('data/fed_fpb.geojson') // this loads in the geojson that was referenced above
.then(response => response.json())
.then(data => {
    // Add the GeoJSON to the map with the symbols and popups
    createPropSymbols(data);
    console.log(data.features.length) //check for debugging
})
.catch(error => {
    console.error("Error loading GeoJSON: ", error); //error catcher
});

// Create the legend for the PropSymbols map
var legend = L.control({ position: 'bottomright' }); //tells it where to put the legend

//defines legend properties
legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend'); //puts a div in for the legend
    var bins = [0, 1000, 1500, 2500]; //the bins that the data are in
    var labels = []; //empty label var to assign later
    var colors = ["#2ac129", "#cbe808", "#e85808", "red"]; //colors
    var sizes = [(Math.sqrt(1000)/6),(Math.sqrt(1500)/6),(Math.sqrt(2500)/6),(Math.sqrt(4000)/6)]; //hard coded the sizes because it wasn't working otherwise

    // Adding a title to the legend
    div.innerHTML = '<strong>Fish Passage Barrier Volume<br /> (USFS and BLM Only)</strong><br>'; // Add the legend title

    // This loops through the bins and generates a label with a colored circle for each one
    for (var i = 0; i < bins.length; i++) {
        var circle = L.circleMarker([0, 0], {
            radius: sizes[i], 
            fillColor: colors[i],
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9
        });

        // Create legend label with the circle and range
        labels.push(
            '<i style="width: ' + sizes[i] * 2 + 'px; height: ' + sizes[i] * 2 + 'px; background: ' + colors[i] + '; display: inline-block; margin-right: 5px; border-radius: 50%;"></i> ' + // Adjust circle size here
            bins[i] + (bins[i + 1] ? '&ndash;' + bins[i + 1] : '+')
        );
    }

    div.innerHTML += labels.join('<br>'); // puts it all together
    return div;
};




// Adds the legend to the map
legend.addTo(map);


//now the cholopleth

  // Initialize the map
  var map2 = L.map('chloropleth', {
    crs: L.CRS.EPSG3857 
   }).setView([44.1,-120.5], 7); // Center of the map at these coordinates with zoom level 7

   // Add a tile layer (this is ESRI Satellite tiles)
   L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
       attribution: '&copy; <a href="https://www.esri.com/en-us/legal/terms/data-attributions"> ESRI Satellite Imagery</a> contributors'
   }).addTo(map2);

   //Need to create join point counts to a county polygon layer
   //I tried to use turf to do this, which I would have done by checking
   //point by point if they were contained in the polygons, but I
   //couldn't get it to work so I just used qgis

   //make our scale, I used jenking for this. I found this shorhand for if-else really handy.
   function chloromaker(d) {
    return  d > 3729 ? '#A31837':
            d > 1865 ? '#B34F2C':
            d > 1600 ? '#C48622':
            d > 1079 ? '#D4BD18':
            d > 850 ? '#E5F50E':
            d > 518 ? '#8FE216':
            d > 198 ? '#39CF1F':
                      '#FFEDA0';
   }

   //parameterizing style options
   
   function chloro(feature) {
    return {
        fillColor: chloromaker(feature.properties.number_of_blockages), //defining symbol options, similar to the first map
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '0',
        fillOpacity: 0.5
    };
}
   // Fetch counties first
   fetch('data/map.geojson')  // Load the counties GeoJSON file
   .then(response => response.json())
   .then(countiespoly => {
       // Create the counties polygons layer
       L.geoJson(countiespoly, {style: chloro,
        onEachFeature: function (feature, layer) {
            // Binds a popup to each county polygon
            var countyName = feature.properties.COUNTY_NAM; //county name
            var numBarriers = feature.properties.number_of_blockages; // number of blockages
            var popupContent = "<strong>County:</strong> " + countyName + 
                               "<br><strong>Number of Barriers:</strong> " + numBarriers;
            layer.on('mouseover', function() { //popup shows up when mouse over
                layer.bindPopup(popupContent).openPopup();
            });

            layer.on('mouseout', function() { //and closes when the mouse moves away
                layer.bindPopup(popupContent).closePopup();
            });
            
        }
       }).addTo(map2); //adds it to the map
       
   });
   
// This makes the legend for the chloropleth map, similarly to how it is done above:
var legend2 = L.control({ position: 'bottomright' });

legend2.onAdd = function () { 
    var div = L.DomUtil.create('div', 'info legend');
    var bins = [0, 198, 518, 850, 1079, 1600, 1865, 3729];
    var labels = [];
    var colors = [
        '#FFEDA0', '#39CF1F', '#8FE216', '#E5F50E', '#D4BD18', 
        '#C48622', '#B34F2C', '#A31837'
    ];

    div.innerHTML = '<strong>Number of Fish Passage <br /> Barriers per County</strong><br>'; // Add the legend title

    // This loops through the bins and generates a label with a colored square for each
    for (var i = 0; i < bins.length; i++) { 
        // Use <span> and style it to create a square
        labels.push(
            '<span style="background:' + colors[i] + '; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></span> ' +
            bins[i] + (bins[i + 1] ? '&ndash;' + bins[i + 1] : '+') //this makes the icons and labels display on the legend
        );
    }

    div.innerHTML += labels.join('<br>'); //Puts the title and Legend entries together
    return div;
};

// Add the legend to the map
legend2.addTo(map2);

//and done!

   
