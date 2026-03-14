"use client";

import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { Icon } from "leaflet";
import type { StoreLocation } from "@/features/stores/data/stores";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapFocus({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo([lat, lng], 12, { duration: 0.8 });
  }, [lat, lng, map]);

  return null;
}

interface StoreLocatorMapProps {
  stores: StoreLocation[];
  selectedStoreId: string;
  onSelectStore: (storeId: string) => void;
}

export function StoreLocatorMap({
  stores,
  selectedStoreId,
  onSelectStore,
}: StoreLocatorMapProps) {
  const selectedStore =
    stores.find((store) => store.id === selectedStoreId) ?? stores[0];

  return (
    <MapContainer
      center={[selectedStore.lat, selectedStore.lng]}
      zoom={11}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapFocus lat={selectedStore.lat} lng={selectedStore.lng} />
      {stores.map((store) => (
        <Marker
          key={store.id}
          position={[store.lat, store.lng]}
          icon={markerIcon}
          eventHandlers={{
            click: () => onSelectStore(store.id),
          }}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">{store.name}</p>
              <p className="text-xs text-slate-600">{store.address}</p>
              <p className="text-xs text-slate-600">{store.phone}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
