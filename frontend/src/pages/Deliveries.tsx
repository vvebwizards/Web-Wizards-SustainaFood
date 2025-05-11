import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const hubIcon = new L.Icon({
  iconUrl: 'https://www.pngplay.com/wp-content/uploads/9/Map-Marker-PNG-Pic-Background.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

interface Order {
  lat: number;
  lng: number;
  address: string;
  name?: string;
}

interface Cluster {
  orders: Order[];
  color: string;
}

const DeliveriesRoutes: React.FC = () => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hub, setHub] = useState<[number, number] | null>(null);

  const fetchClusters = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders/assign_clusters', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to fetch clusters');
      const data = await res.json();
      setClusters(data.clusters || []);
    } catch (err) {
      console.error('Error fetching clusters:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setHub([latitude, longitude]);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setHub([36.8065, 10.1815]);
      }
    );
  }, []);

  useEffect(() => {
    fetchClusters();
  }, []);

  if (loading || !hub) {
    return <div>Loading map and clusters...</div>;
  }
  const Routing: React.FC<{ orders: Order[]; color: string }> = ({ orders, color }) => {
    if (!orders || orders.length === 0 || !hub) return null;

    const routeCoords = [hub, ...orders.map(order => [order.lat, order.lng])];

    return (
      <>
        <Marker position={hub} icon={hubIcon}>
          <Popup>Main Hub (Your Location)</Popup>
        </Marker>
        {orders.map((order, i) => (
          <Marker key={i} position={[order.lat, order.lng]}>
            <Popup>{order.address || order.name || 'No address'}</Popup>
          </Marker>
        ))}
        <Polyline positions={routeCoords} pathOptions={{ color, weight: 4 }} />
      </>
    );
  };

  return (
    <div className="h-screen flex flex-col">
     <div className="p-4">
      <h2 className="text-xl font-semibold text-gray-800">Delivery Map</h2>
      <p className="text-gray-600 ">
        This map shows where your orders are going. Routes start from your current location and group nearby deliveries using different colors. This helps make deliveries faster, reduces travel distance and time, and cuts down on emissions. Click on a marker to view the order number.
      </p>
    </div>
      <MapContainer center={hub} zoom={12} className="flex-1 w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {clusters.map((cluster, index) => (
          <Routing key={index} orders={cluster.orders} color={cluster.color} />
        ))}
      </MapContainer>
    </div>
  );
};

export default DeliveriesRoutes;
