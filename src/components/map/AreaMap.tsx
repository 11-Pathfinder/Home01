"use client";

import { useEffect, useRef, useState } from "react";
import type { School, Station } from "@/lib/types";
import { ofstedColor } from "@/lib/utils";

// London center coordinates
const LONDON_CENTER: [number, number] = [51.5074, -0.1278];
const DEFAULT_ZOOM = 11;

interface AreaMapProps {
  center?: [number, number];
  zoom?: number;
  marker?: [number, number];
  schools?: School[];
  stations?: Station[];
  className?: string;
}

export default function AreaMap({
  center,
  zoom,
  marker,
  schools = [],
  stations = [],
  className = "",
}: AreaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  // Load Leaflet dynamically (client-side only)
  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(
      center ?? LONDON_CENTER,
      zoom ?? DEFAULT_ZOOM
    );

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [L]);

  // Update center when it changes
  useEffect(() => {
    if (!mapInstanceRef.current || !center) return;
    mapInstanceRef.current.flyTo(center, zoom ?? 14, { duration: 1.5 });
  }, [center, zoom]);

  // Update marker
  useEffect(() => {
    if (!L || !mapInstanceRef.current) return;

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (marker) {
      markerRef.current = L.marker(marker, {
        icon: L.divIcon({
          className: "bg-transparent",
          html: `<div style="width:24px;height:24px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(mapInstanceRef.current);
    }
  }, [L, marker]);

  // Update school and station markers
  useEffect(() => {
    if (!L || !layerGroupRef.current) return;
    layerGroupRef.current.clearLayers();

    // School markers
    for (const school of schools) {
      const color = ofstedColor(school.ofstedRating);
      const m = L.circleMarker([school.lat, school.lng], {
        radius: 7,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      m.bindPopup(
        `<strong>${school.name}</strong><br/>
         ${school.phase}<br/>
         Ofsted: <span style="color:${color};font-weight:bold">${school.ofstedRating || "Not rated"}</span><br/>
         ${school.distance.toFixed(1)}km away`
      );

      layerGroupRef.current.addLayer(m);
    }

    // Station markers
    for (const station of stations) {
      const modeColors: Record<string, string> = {
        tube: "#0019a8",
        dlr: "#00b0b0",
        overground: "#ef7b10",
        "elizabeth-line": "#6950a1",
        rail: "#e21836",
      };
      const color = modeColors[station.mode] || "#666";

      const m = L.circleMarker([station.lat, station.lng], {
        radius: 6,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      });

      m.bindPopup(
        `<strong>${station.name}</strong><br/>
         ${station.mode.charAt(0).toUpperCase() + station.mode.slice(1)}<br/>
         ${station.lines.join(", ")}<br/>
         ${station.distance}m away`
      );

      layerGroupRef.current.addLayer(m);
    }
  }, [L, schools, stations]);

  return (
    <div
      ref={mapRef}
      className={`h-full w-full ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
}
