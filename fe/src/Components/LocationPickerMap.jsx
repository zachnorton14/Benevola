import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon from '../Assets/mapMarker.png';

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
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onSelect={onChange} />

      {value && <Marker position={value} icon={customMarkerIcon} />}
    </MapContainer>
  );
}
