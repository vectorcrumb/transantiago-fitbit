// import * as Promise from "bluebird";

export function TransantiagoAPI() {

};

TransantiagoAPI.prototype.findStopSchedule = function(stop_code) {
    return new Promise(function (resolve, reject) {
        let url = "https://api.scltrans.it/v2/stops/" + stop_code + "/next_arrivals";
        console.log("Querying URL for stops schedule: " + url);
        fetch(url, {method: "GET"}).then(function(resp) {
            return resp.json();
        }).then(function(api_json) {
            let filtered_routes = [];
            let routes = api_json.results;
            // If there is more than 1 bus available for a route, it'll appear as a repeat element, will all the 
            // pertinent information displayed twice. This means that we don't have to handle repeats and we can just 
            // send all elements to the display. The display can then group buses from the same route or sort by distance.
            routes.forEach( (route) => {
                // A bus schedule will contain a list of objects for each route. To determine if the route is valid
                // check if the bus_plate_number o bus_distance isn't null.
                if (route.bus_plate_number !== null) {
                    // The time estimates are extracted from the arrival_estimation field. If the bus is too close
                    // or too far, the time estimate becomes less than 5 minutes or more than 45 minutes, so the
                    // regex will only match 1 value instead of 2. Seeing as this value is very different (5 vs. 45), 
                    // the appropriate display logic (show "less than" or "more than") is relegated to the display logic.
                    let estimation_times = route.arrival_estimation.match(/\d+/g);
                    // We care about the time estimate, plate number, distance and route id
                    filtered_routes.push({
                        'bus_plate_number': route.bus_plate_number,
                        'time': estimation_times,
                        'route_id': route.route_id,
                        'bus_distance': route.bus_distance,
                        'available': true
                    })
                } else {
                    // If the route doesn't have any available bus data, we still push the route date, but without any buses
                    // The display logic takes the available field and determines that it must show that no buses are avaiable
                    filtered_routes.push({
                        'route_id': route.route_id,
                        'available': false
                    })
                }
            });
            resolve(filtered_routes);
        }).catch(function (error) {
            reject(error);
        });
    });
}

TransantiagoAPI.prototype.findNearestStop = function(lat, lon, radius) {
    /**
     * Code for fetching: https://community.fitbit.com/t5/SDK-Development/Can-we-use-companion-fetch-API-in-the-simulator/td-p/2636180
     * For some reason, that exact structure is the only way to make the fetch work.
     */
    return new Promise(function(resolve, reject) {
        // Construct a URL from given location and radius
        let url = "https://api.scltrans.it/v1/stops?limit=5";
        url += "&center_lat=" + lat;
        url += "&center_lon=" + lon;
        url += "&radius=" + radius;
        console.log("Querying URL for nearest stop: " + url);
        // Fetch function to obtain nearest stop information.
        fetch(url, {method: "GET"}).then(function(resp) {
            return resp.json();
        }).then(function (api_json) {
            let nearest_stop = "";
            if (api_json.results.length > 0) {
                let stops = api_json.results;
                // If there are results for the given coordinates, estimate the distance to the stops and return the closest one.
                stops.forEach( (stop) => {
                    stop.distance = greaterCircleDistanceApproximation(stop.stop_lat, stop.stop_lon, lat, lon);
                });
                // The API can access metro stations, so we should filter by bus (TS) or metro (M) in the agency_id field
                stops = stops.filter( (stop) => { return stop.agency_id == "TS"; });
                // Sort the stops by distance and show results
                stops.sort( (a, b) => { return (a.distance - b.distance); });
                console.log("Found " + stops.length + " stops. Stops ordered by distance are:")
                stops.forEach( (stop) => { console.log(stop.stop_code + ": " + Math.round(stop.distance * 1000) + "m."); });
                nearest_stop = stops[0].stop_code;
            } else {
                // If no stops were found, return an error. This error will be of type string, so the correct UI update can be issued
                reject("No stops were found nearby.");
            }
            resolve(nearest_stop);
        }).catch(function (error) {
            reject(error);
        });
    });
}

function greaterCircleDistanceApproximation(lat, lng, lat0, lng0) {
    // Adapted from http://jonisalonen.com/2014/computing-distance-between-coordinates-can-be-simple-and-fast/
    let deg2km = 110.25;
    let delta_x = lat - lat0;
    let delta_y = (lng - lng0) * Math.cos(lat);
    return deg2km * Math.sqrt(delta_x * delta_x + delta_y * delta_y); 
}