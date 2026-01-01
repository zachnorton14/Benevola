import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import markerIcon from '../Assets/mapMarker.png';

function RecenterMap({ value }) {
  const map = useMap()

  useEffect(() => {
    if (!value) return

    map.setView(
      [value.lat, value.lng],
      map.getZoom(),
      { animate: true }
    )
  }, [value, map])

  return null
}

export const customMarkerIcon = L.icon({
  iconUrl: markerIcon,
  iconSize: [48, 48],      // width, height
  iconAnchor: [16, 32],    // point of the icon which corresponds to marker position
  popupAnchor: [0, -32],   // popup position relative to iconAnchor
});


function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onSelect({ lat, lng });
    },
  });
  return null;
}

export default function LocationPickerMap({ value, onChange }) {
  const center = value ?? { lat: 35.7796, lng: -78.6382 }; // default center

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
    >

    <RecenterMap value={value} />

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onSelect={onChange} />

      {value && <Marker position={value} icon={customMarkerIcon} />}
    </MapContainer>
  );
}
