import { document } from "document";

export function MicrosUI() {
    this.busList = document.getElementById("busList");
    this.statusText = document.getElementById("status");
}

MicrosUI.prototype.updateUI = function(state, schedule) {
    
}