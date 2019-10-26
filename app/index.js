/*
 * Entry point for the watch app
 */
import document from "document";
import geolocation from "geolocation";
// import { peerSocket } from "messaging";

// let demotext = document.getElementById("demotext");
// demotext.text = "Fitbit Studio rocks!";



let lati_text = document.getElementById("lati");
let long_text = document.getElementById("long");
var watchID = geolocation.watchPosition(
    function(position) {
        lati_text.text = "Lat: " + position.coords.latitude.toFixed(5);
        long_text.text = "Long: " + position.coords.longitude.toFixed(5);
    }, function(error) {
        console.log("Error: " + error.code, "Message: " + error.message);
});

// peerSocket.onopen = function() {

// }
