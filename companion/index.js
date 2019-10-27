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
    let transapi = new TransantiagoAPI();
    console.log("Received a GPS update. Getting nearest stop.");
    console.log(transapi);
    transapi.findNearestStop(lati, long, rad).then(function (value) {
        console.log("Succesful stops function call", value);
    }).catch(function (e) {
        console.log("Error in stops function call", e);
    });
    // transapi.findNearestStop(lat, lon).then(function (stop) {
    //     console.log("Obtained nearest stop. Getting schedule.");
    //     transapi.findBusesForStop(stop["stop_code"]).then(function (schedule) {
    //         console.log("Obtained schedule: ", schedule);
    //     }).catch(function (e) {
    //         console.log("Error getting scedule for stop.", e);
    //     });
    // }).catch(function (e) {
    //     console.log("Error getting nearest stop.", e);
    // });
}