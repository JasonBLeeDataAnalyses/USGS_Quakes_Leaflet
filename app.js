// Store our API endpoint inside eartquakes_url
let quakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
console.log(quakesUrl);

// Store our API endpoint inside tectonicplates_url
let platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
console.log(platesUrl);

// Perform a GET request to the eartquakes URL
d3.json(quakesUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Function to scale the Magnitude 
function markerSize(magnitude) {
  return magnitude * 30000;
};

// Function to assign color depends on the Magnitude
function getColor(m) {

  let colors = ['green','yellowgreen','yellow','darksalmon','darkorange','darkred'];

  return  m > 5? colors[5]:
          m > 4? colors[4]:
          m > 3? colors[3]:
          m > 2? colors[2]:
          m > 1? colors[1]:
                 colors[0];
};

function createFeatures(earthquakeData) {

  let earthquakes = L.geoJSON(earthquakeData,{
    // Give each feature a popup describing with information pertinent to it
    onEachFeature: function(feature, layer){
      layer.bindPopup("<h3 > Magnitude: "+ feature.properties.mag + 
      "</h3><h3 >Location: " + feature.properties.place +
      "</h3><hr><h3>" + new Date(feature.properties.time) + "</h3>" );
    },

    pointToLayer: function(feature, latlng){
      return new L.circle(latlng,
      { radius: markerSize(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        fillOpacity: .8,
        color: 'grey',
        weight: .5
      })
    }    
  });

  createMap(earthquakes);
};  
  
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  let streetMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiamJsZWVkYXRhIiwiYSI6ImNqaDFhamdvbjAxdXczM2xpbzdhdWV4YnkifQ." +
    "f_78xKsU27lo3HKzy84MnA");

  let darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiamJsZWVkYXRhIiwiYSI6ImNqaDFhamdvbjAxdXczM2xpbzdhdWV4YnkifQ." +
    "f_78xKsU27lo3HKzy84MnA");

  let satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiamJsZWVkYXRhIiwiYSI6ImNqaDFhamdvbjAxdXczM2xpbzdhdWV4YnkifQ." +
    "f_78xKsU27lo3HKzy84MnA");  

  let tectonicPlates = new L.LayerGroup();
    
  d3.json(platesUrl, function(boundaryData) {
      // Once we get a response, send the data.features object to the createFeatures function
      L.geoJson(boundaryData, 
      {
        color: "darkred",
        weight: 2
      })
      .addTo(tectonicPlates);
  });  

  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Street Map": streetMap,
    "Dark Map": darkMap,
    "Satellite Map" : satelliteMap
  };
  
  // Create overlay object to hold our overlay layer
  let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [30, 0],
    zoom: 3,
    layers: [streetMap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  // Create a legend to display information in the bottom right
  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function(map) {

    let div = L.DomUtil.create('div','info legend'),
        magnitudes = [0,1,2,3,4,5],
        labels = [];

    div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>" 
    // loop through our density intervals and generate a label for each interval
    for (let i=0; i < magnitudes.length; i++){
      div.innerHTML +=
        '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
        magnitudes[i] + (magnitudes[i+1]?'&ndash;' + magnitudes[i+1] +'<br>': '+');
      }
      return div;
  };
  legend.addTo(myMap);
}