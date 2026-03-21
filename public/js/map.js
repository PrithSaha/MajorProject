document.addEventListener("DOMContentLoaded", function () {
    const mapElement = document.getElementById("map");

    if (!mapElement) return;


    let coords;
    try {
        coords = JSON.parse(mapElement.dataset.coords);
    } catch (err) {
        console.error("Invalid coordinates, using fallback");
        coords = [28.6139, 77.2090]; // fallback (Delhi)
    }


    const location = mapElement.dataset.location || "Unknown location";

    const map = L.map('map').setView(coords, 13);


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);


    const redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });


    const marker = L.marker(coords, { icon: redIcon }).addTo(map);

    marker.bindPopup(`
        <h4>${location}:</h4><i>Exact location will be provided after booking<i>`);


    marker.on("mouseover", function () {
        this.openPopup();
    });

    marker.on("mouseout", function () {
        this.closePopup();
    });
});