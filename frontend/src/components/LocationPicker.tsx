// components/LocationPicker.tsx
import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

interface LocationPickerProps {
  onSelect: (lat: number, lng: number) => void;
}

const LocationMarker: React.FC<LocationPickerProps> = ({ onSelect }) => {
  const [position, setPosition] = React.useState<L.LatLng | null>(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position}></Marker> : null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({ onSelect }) => {
  return (
    <MapContainer center={[36.8065, 10.1815]} zoom={13} style={{ height: "300px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onSelect={onSelect} />
    </MapContainer>
  );
};

export default LocationPicker;
