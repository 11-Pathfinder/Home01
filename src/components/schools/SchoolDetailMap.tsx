"use client";

import { useEffect, useRef, useState } from "react";
import type { School } from "@/lib/types";
import { ofstedColor } from "@/lib/utils";

interface SchoolDetailMapProps {
  school: School;
  nearby: School[];
}

export default function SchoolDetailMap({
  school,
  nearby,
}: SchoolDetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);

  useEffect(() => {
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([school.lat, school.lng], 15);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Main school marker — larger, with a pulse ring
    const mainColor = ofstedColor(school.ofstedRating);
    L.circleMarker([school.lat, school.lng], {
      radius: 12,
      fillColor: mainColor,
      color: "#fff",
      weight: 3,
      opacity: 1,
      fillOpacity: 0.9,
    })
      .bindPopup(
        `<strong>${school.name}</strong><br/>${school.phase}<br/>Ofsted: <span style="color:${mainColor};font-weight:bold">${school.ofstedRating || "Not rated"}</span>`
      )
      .addTo(map)
      .openPopup();

    // Nearby school markers — smaller
    const bounds = L.latLngBounds([[school.lat, school.lng]]);

    for (const s of nearby) {
      const c = ofstedColor(s.ofstedRating);
      L.circleMarker([s.lat, s.lng], {
        radius: 6,
        fillColor: c,
        color: "#fff",
        weight: 1.5,
        opacity: 0.8,
        fillOpacity: 0.6,
      })
        .bindPopup(
          `<strong>${s.name}</strong><br/>${s.phase}<br/>Ofsted: <span style="color:${c};font-weight:bold">${s.ofstedRating || "Not rated"}</span>${s.distance != null ? `<br/>${(s.distance * 1000).toFixed(0)}m away` : ""}`
        )
        .addTo(map);
      bounds.extend([s.lat, s.lng]);
    }

    if (nearby.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [L, school, nearby]);

  return (
    <div
      ref={mapRef}
      className="h-full w-full"
      style={{ minHeight: "400px" }}
    />
  );
}
