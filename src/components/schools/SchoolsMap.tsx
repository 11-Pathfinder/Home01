"use client";

import { useEffect, useRef, useState } from "react";
import type { School } from "@/lib/types";
import { ofstedColor } from "@/lib/utils";

const LONDON_CENTER: [number, number] = [51.5074, -0.1278];

interface SchoolsMapProps {
  schools: School[];
  highlightedUrn?: number | null;
  onMarkerClick?: (urn: number) => void;
  className?: string;
}

export default function SchoolsMap({
  schools,
  highlightedUrn,
  onMarkerClick,
  className = "",
}: SchoolsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<number, L.CircleMarker>>(new Map());
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(LONDON_CENTER, 11);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    mapInstanceRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [L]);

  // Update markers when schools change
  useEffect(() => {
    if (!L || !layerGroupRef.current || !mapInstanceRef.current) return;
    layerGroupRef.current.clearLayers();
    markersRef.current.clear();

    if (schools.length === 0) return;

    const bounds = L.latLngBounds([]);

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
         ${school.numberOfPupils ? school.numberOfPupils + " pupils" : ""}`
      );

      if (onMarkerClick) {
        m.on("click", () => onMarkerClick(school.urn));
      }

      layerGroupRef.current!.addLayer(m);
      markersRef.current.set(school.urn, m);
      bounds.extend([school.lat, school.lng]);
    }

    mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
  }, [L, schools, onMarkerClick]);

  // Highlight selected marker
  useEffect(() => {
    if (!L || !mapInstanceRef.current) return;

    for (const [urn, marker] of markersRef.current) {
      if (urn === highlightedUrn) {
        marker.setRadius(12);
        marker.setStyle({ weight: 3 });
        marker.openPopup();
        mapInstanceRef.current.panTo(marker.getLatLng());
      } else {
        marker.setRadius(7);
        marker.setStyle({ weight: 2 });
      }
    }
  }, [L, highlightedUrn]);

  return (
    <div
      ref={mapRef}
      className={`h-full w-full ${className}`}
      style={{ minHeight: "400px" }}
    />
  );
}
