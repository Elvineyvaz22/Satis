'use client';

import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onPick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

interface Props {
  customerName: string;
  customerId: number | string;
  onSaved: () => void;
  onClose: () => void;
}

export default function LocationPicker({ customerName, customerId, onSaved, onClose }: Props) {
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!pin) return;
    setSaving(true);
    await fetch(`/api/customers/${customerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: pin.lat, lon: pin.lng }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <div className="font-semibold text-gray-900">Konum seç</div>
            <div className="text-xs text-gray-400">{customerName} — xəritəyə klikləyin</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none px-1">✕</button>
        </div>

        {/* Map */}
        <div className="relative">
          <MapContainer
            center={[40.4093, 49.8671]}
            zoom={12}
            style={{ height: '380px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ClickHandler onPick={(lat, lng) => setPin({ lat, lng })} />
            {pin && <Marker position={[pin.lat, pin.lng]} />}
          </MapContainer>

          {!pin && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 shadow">
                📍 Konumu seçmək üçün xəritəyə klikləyin
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-200">
          {pin ? (
            <span className="text-xs text-gray-500 flex-1">
              {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
            </span>
          ) : (
            <span className="text-xs text-gray-400 flex-1">Seçilməyib</span>
          )}
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition">
            Ləğv et
          </button>
          <button
            onClick={save}
            disabled={!pin || saving}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
          >
            {saving ? 'Saxlanılır...' : 'Saxla'}
          </button>
        </div>
      </div>
    </div>
  );
}
