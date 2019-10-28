/*
 * Entry point for the companion app
 */

import {me} from "companion";
import { peerSocket } from "messaging";
import { TransantiagoAPI } from "./transantiago.js"

console.log("Companion code started");

peerSocket.onopen = function() {
    sendLoadingMessage();
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
    // Log message to console
    console.log(JSON.stringify(evt.data));
}


function sendLoadingMessage () {
    peerSocket.send({
        "message": "Awaiting connection ..."
    });
}

function sendClosestStopSchedule(lati, long, rad) {
    let transantiago_api = new TransantiagoAPI();
    // console.log("Received a GPS update. Getting nearest stop.");
    transantiago_api.findNearestStop(lati, long, rad).then(function (nearest_stop) {
        console.log("Closest stop found is " + nearest_stop);
        transantiago_api.findStopSchedule(nearest_stop).then(function(schedule) {
            console.log("Obtained schedule: ", schedule);
        }).catch(function(err) {
            console.log("Error finding schedule for stop: " + err);
        });
    }).catch(function (err) {
        console.log("Error finding closest stop: " + err);
    });
}