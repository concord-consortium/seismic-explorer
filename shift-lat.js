// Script that shifts longitude values in geoJSON files.
// Accepts two arguments: filename and direction (left or right)
// E.g. node shift-lat.js publc/datasets/alaskagroup.json right

var fs = require('fs');
var args = process.argv.slice(2);
var fileName = args[0]
var direction = args[1] || 'right'

var geoJSON = JSON.parse(fs.readFileSync(fileName).toString());
shiftLongitude(geoJSON, direction)
var textResult = JSON.stringify(geoJSON);
textResult = textResult.replace(/\{"type":"Feature/g, "\n{\"type\":\"Feature");
fs.writeFileSync(fileName, textResult);

function shiftLongitude(geoJSON, dir) {
  geoJSON.features.forEach(function (feature, index) {
    if (index % 1000 === 0) process.stdout.write(".")

    if (feature.geometry && feature.geometry.type === "Polygon" && feature.geometry.coordinates) {
      feature.geometry.coordinates.forEach(function (coordList) {
        coordList.forEach(function (coord) {
          shiftCoordinate(coord, dir);
        })
      })
    }
    if (feature.geometry && feature.geometry.type === "Point" && feature.geometry.coordinates) {
      shiftCoordinate(feature.geometry.coordinates, dir);
    }
  })
}

function shiftCoordinate(coord, dir) {
  if (coord[0] < 0 && dir == 'right') {
    coord[0] = coord[0] + 360;
  } else if (coord[0] > 0 && dir == 'left') {
    coord[0] = coord[0] - 360;
  }
}
