// import * as Promise from "bluebird";

export function TransantiagoAPI() {
    this.numvar = 10;
};

TransantiagoAPI.prototype.findBusesForStop = function(stop_code) {
    return new Promise(function (resolve, reject) {
        resolve(stop_code);
    });
}

TransantiagoAPI.prototype.findNearestStop = function(lat, lon, radius) {
    let self = this;
    let url = "https://api.scltrans.it/v1/stops?limit=5";
    url += "&center_lat=" + lat;
    url += "&center_lon=" + lon;
    url += "&radius=" + radius;
    console.log("Querying URL:" + url);
    fetch(url, {method: "GET"}).then(function(resp) {
        return resp.json();
    }).then(function (jsonret) {
        console.log("URL response", jsonret);
    }).catch(function (error) {
        console.log("Caught an error fetching stops!", error);
    });
    // console.log("Finding nearest stop in a " + radius !== undefined ? radius : 100 + "[m] distance.");
    let promisevar =  new Promise(function(resolve, reject) {
        let url = "https://api.scltrans.it/v1/stops?limit=5";
        url += "&center_lat=" + lat;
        url += "&center_lon=" + lon;
        url += "&radius=" + radius;
        console.log("Querying URL:" + url);
        fetch(url).then(function (response) {
            return response.json();
        }).then(function (json) {
            if (json['total_results'] > 0) {
                let data = json["results"];
                data.forEach( (stop) => {
                    let deg2km = 110.25;
                    let delta_x = stop["stop_lat"] - lat;
                    let delta_y = (stop["stop_lon"] - lon) * Math.cos(lat);
                    stop.distance = deg2km * Math.sqrt(delta_x * delta_x + delta_y * delta_y);
                    // stop.distance = stop.distance;
                });
                data.sort( (a, b) => {
                    return (a["distance"] - b["distance"]);
                });
            }
            resolve(data);
        }).catch(function (error) {
            reject(error);
        });
    });
    return promisevar;
}