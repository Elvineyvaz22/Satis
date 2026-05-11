'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const debtIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const paidIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface CustomerPin {
  name: string;
  phone?: string;
  lat: number;
  lng: number;
  debt: number;
  total: number;
  paid: number;
  count: number;
}

export default function MapView({ pins }: { pins: CustomerPin[] }) {
  const center: [number, number] = pins.length > 0
    ? [pins.reduce((a, p) => a + p.lat, 0) / pins.length, pins.reduce((a, p) => a + p.lng, 0) / pins.length]
    : [40.4093, 49.8671]; // Baku default

  return (
    <MapContainer center={center} zoom={11} style={{ height: '500px', width: '100%', borderRadius: '1rem' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.map((pin, i) => (
        <Marker key={i} position={[pin.lat, pin.lng]} icon={pin.debt > 0 ? debtIcon : paidIcon}>
          <Popup>
            <div className="text-sm min-w-[160px]">
              <div className="font-bold text-gray-900 mb-1">{pin.name}</div>
              {pin.phone && <div className="text-gray-500 text-xs mb-1">{pin.phone}</div>}
              <div className="text-xs space-y-0.5">
                <div>Sifarişlər: <b>{pin.count}</b></div>
                <div>Cəmi: <b>{pin.total.toFixed(2)} ₼</b></div>
                <div>Ödənilib: <b className="text-green-600">{pin.paid.toFixed(2)} ₼</b></div>
                {pin.debt > 0 && <div>Borc: <b className="text-red-500">{pin.debt.toFixed(2)} ₼</b></div>}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
