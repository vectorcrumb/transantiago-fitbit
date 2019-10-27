/*
 * Entry point for the watch app
 */

import { document } from "document";
import { geolocation } from "geolocation";
import { peerSocket } from "messaging";



var watchID = geolocation.watchPosition(
    function(position) {
        // Send GPS coordinates if a connection has been established.
        if (peerSocket.readyState == peerSocket.OPEN) {
            peerSocket.send({
                "type": "gps",
                "lat": position.coords.latitude.toFixed(6),
                "lon": position.coords.longitude.toFixed(6),
            });
        }
        console.log("Update position" + "\nLatitude: " + position.coords.latitude.toFixed(5) + "\nLongitude: " + position.coords.longitude.toFixed(5));
    }, function(error) {
        console.log("Error: " + error.code, "Message: " + error.message);
});

peerSocket.onopen = function() {
    // Send a 
    peerSocket.send({
        "type": "status",
        "message": "Connection has been established."
    });
}
