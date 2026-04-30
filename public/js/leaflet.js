/* eslint-disable */

export const displayMap = locations => {
  if (!locations || locations.length === 0) return;

  const firstLocation = locations[0].coordinates;
  const firstLatLng = [firstLocation[1], firstLocation[0]]; // Leaflet uses [lat, lng]

  const map = L.map('map', {
    scrollWheelZoom: false
  }).setView(firstLatLng, 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const bounds = [];

  locations.forEach(loc => {
    const [lng, lat] = loc.coordinates;
    const latLng = [lat, lng];

    bounds.push(latLng);

    L.marker(latLng)
      .addTo(map)
      .bindPopup(`Day ${loc.day}: ${loc.description}`)
      .openPopup();
  });

  map.fitBounds(bounds, {
    padding: [100, 100],
    maxZoom: 12
  });
};