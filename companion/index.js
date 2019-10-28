/*
 * Entry point for the companion app
 */

import {me} from "companion";
import { peerSocket } from "messaging";
import { TransantiagoAPI } from "./transantiago.js"

console.log("Companion code started");

peerSocket.onopen = function() {

}

// OnMessage Listener for Companion app
peerSocket.onmessage = function(evt) {
    if (evt.data.type == "status") {
        console.log("Message received was of type: status");
    } else if (evt.data.type == "gps") {
        console.log("Message received was of type: gps");
        // If a GPS update is received, obtain nearest stop schedule
        sendClosestStopSchedule(evt.data.lat, evt.data.lon, 100);
    }
}


function sendClosestStopSchedule(lati, long, rad) {
    let transantiago_api = new TransantiagoAPI();
    // console.log("Received a GPS update. Getting nearest stop.");
    transantiago_api.findNearestStop(lati, long, rad).then(function (nearest_stop) {
        console.log("Closest stop found is " + nearest_stop);
        transantiago_api.findStopSchedule(nearest_stop).then(function(schedule) {
            // To avoid contaminating the console output so much, we'll filter the schedule results
            schedule.forEach( (route) => { console.log(route.route_id + ". Available?  " + route.available) })
            // Having obtained the schedule for the closest bus stop, we can send the data back to the watch
            // for it to update the UI of the application.
            if(peerSocket.readyState === peerSocket.OPEN) {
                peerSocket.send(schedule);
            }
        }).catch(function(err) {
            console.log("Error finding schedule for stop: " + err);
        });
    }).catch(function (err) {
        console.log("Error finding closest stop: " + err);
    });
}