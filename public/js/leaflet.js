/* eslint-disable */

export const displayMap = (locations) => {
  if (!locations || locations.length === 0) return;

  const map = L.map('map', {
    scrollWheelZoom: false,
    zoomControl: false,
    doubleClickZoom: false,
    touchZoom: false,
    boxZoom: false,
    keyboard: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  const bounds = [];
  const markers = [];

  const markerIcon = L.icon({
    iconUrl: '/img/pin.png',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -38],
  });

  locations.forEach((loc) => {
    const [lng, lat] = loc.coordinates;
    const latLng = [lat, lng];

    bounds.push(latLng);

    const marker = L.marker(latLng, { icon: markerIcon })
      .addTo(map)
      .bindPopup(`Day ${loc.day}: ${loc.description}`, {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        autoPan: false,
      });

    markers.push(marker);
  });

  map.fitBounds(bounds, {
    padding: [120, 120],
    maxZoom: 10,
  });

  setTimeout(() => {
    map.invalidateSize();
    markers.forEach((marker) => marker.openPopup());
  }, 300);
};
