import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  onSelect: (lat: number, lng: number) => void;
}

const defaultCenter: [number, number] = [36.8065, 10.1815]; // Tunis center

const LocationPicker: React.FC<Props> = ({ onSelect }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [query, setQuery] = useState("");
  const mapRef = useRef<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPos);
        onSelect(newPos[0], newPos[1]);
        if (mapRef.current) {
          mapRef.current.setView(newPos, 15);
        }
      } else {
        alert("Location not found. Please try a different search.");
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("Failed to search location.");
    }
  };

  function MapUpdater() {
    const map = useMap();
    mapRef.current = map;
    return null;
  }

  return (
    <div>
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a location..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Search
        </button>
      </div>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
      >
        <MapUpdater />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position && <Marker position={position} icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] })} />}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
