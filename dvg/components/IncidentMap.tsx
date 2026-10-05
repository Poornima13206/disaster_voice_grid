"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { CircleMarker as LCircleMarker } from "leaflet";

export type MapIncident = { id: string; areaName: string; issueType: string; maxUrgency: string; lat: number | null; lng: number | null; totalReports: number };
const COLOR: Record<string, string> = { high: "#dc2626", medium: "#f97316", low: "#2563eb" };

function Pin({ i, selected, label }: { i: MapIncident; selected: boolean; label: string }) {
  const ref = useRef<LCircleMarker>(null);
  const map = useMap();
  useEffect(() => {
    if (selected && i.lat != null && i.lng != null) {
      map.flyTo([i.lat, i.lng], Math.max(map.getZoom(), 10), { duration: 0.6 });
      ref.current?.openPopup();
    }
  }, [selected, i.lat, i.lng, map]);
  return (
    <CircleMarker ref={ref} center={[i.lat!, i.lng!]} radius={10 + Math.min(i.totalReports, 10)} pathOptions={{ color: COLOR[i.maxUrgency], fillColor: COLOR[i.maxUrgency], fillOpacity: 0.55 }}>
      <Popup><b>{i.areaName}</b><br />{label}</Popup>
    </CircleMarker>
  );
}

export default function IncidentMap({ incidents, selectedId, labelFor }: { incidents: MapIncident[]; selectedId: string | null; labelFor: (i: MapIncident) => string }) {
  return (
    <MapContainer center={[15.5, 78]} zoom={5} scrollWheelZoom className="h-full w-full">
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {incidents.filter((i) => i.lat != null && i.lng != null).map((i) => (
        <Pin key={i.id} i={i} selected={i.id === selectedId} label={labelFor(i)} />
      ))}
    </MapContainer>
  );
}
