
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Incident } from "../incidents/incidents";

maplibregl.setWorkerUrl(workerUrl);

type Props = {
    incidents: Incident[];
    selectedIncident: Incident | null;
    onSelectIncident: (incident: Incident) => void;
    isPickingLocation: boolean;
    pickedCoordinates: [number, number] | null;
    onPickLocation: (coordinates: [number, number]) => void;
};
export default function CityMap({
    incidents,
    selectedIncident,
    onSelectIncident,
    isPickingLocation,
    pickedCoordinates,
    onPickLocation,
}: Props) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<maplibregl.Map | null>(null);

    const markersRef = useRef<Map<string, maplibregl.Marker>>(
        new Map()
    );

    const onSelectRef = useRef(onSelectIncident);
    const temporaryMarkerRef = useRef<maplibregl.Marker | null>(null);
    const onPickRef = useRef(onPickLocation);
    const isPickingRef = useRef(isPickingLocation);

    useEffect(() => {
        isPickingRef.current = isPickingLocation;
    }, [isPickingLocation]);

    // Keep callback updated without rebuilding the map
    useEffect(() => {
        onSelectRef.current = onSelectIncident;
    }, [onSelectIncident]);

    // Initialize map once
    useEffect(() => {
        if (!mapContainer.current || mapInstance.current) return;

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: "raster",
                        tiles: [
                            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                        ],
                        tileSize: 256,
                        attribution: "© OpenStreetMap contributors",
                    },
                },
                layers: [
                    {
                        id: "osm-layer",
                        type: "raster",
                        source: "osm",
                    },
                ],
            },
            center: [73.0479, 33.6844],
            zoom: 12,
        });

        mapInstance.current = map;

        map.addControl(
            new maplibregl.NavigationControl(),
            "top-right"
        );

        return () => {
            map.remove();
            mapInstance.current = null;
            markersRef.current.clear();
        };
    }, []);

    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current.clear();

        incidents.forEach((incident) => {
            const element = document.createElement("button");

            element.type = "button";
            element.setAttribute("aria-label", incident.title);

            const color = {
                High: "#EA7954",
                Medium: "#D4A04A",
                Low: "#217F79",
            }[incident.severity];

            Object.assign(element.style, {
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                backgroundColor: color,
                border: "3px solid white",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            });

            const marker = new maplibregl.Marker({ element })
                .setLngLat(incident.coordinates)
                .setPopup(
                    new maplibregl.Popup({
                        offset: 20,
                        closeButton: false,
                    }).setText(`${incident.title} (${incident.id})`)
                )
                .addTo(map);

            element.addEventListener("click", (event) => {
                if (isPickingRef.current) {
                    event.stopPropagation();
                    return;
                }

                onSelectRef.current(incident);
            });

            markersRef.current.set(incident.id, marker);
        });

        return () => {
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current.clear();
        };
    }, [incidents]);

    // React to selected incident changes
    useEffect(() => {
        if (!selectedIncident || !mapInstance.current) return;

        const map = mapInstance.current;
        const marker = markersRef.current.get(selectedIncident.id);

        map.flyTo({
            center: selectedIncident.coordinates,
            zoom: 14,
            speed: 0.8,
            essential: true,
        });

        // Close other popups
        markersRef.current.forEach((otherMarker, id) => {
            if (
                id !== selectedIncident.id &&
                otherMarker.getPopup()?.isOpen()
            ) {
                otherMarker.togglePopup();
            }
        });

        if (marker && !marker.getPopup()?.isOpen()) {
            marker.togglePopup();
        }
    }, [selectedIncident]);
    useEffect(() => {
        onPickRef.current = onPickLocation;
    }, [onPickLocation]);

    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        map.getCanvas().style.cursor = isPickingLocation
            ? "crosshair"
            : "";

        if (!isPickingLocation) return;

        const handleClick = (event: maplibregl.MapMouseEvent) => {
            onPickRef.current([
                Number(event.lngLat.lng.toFixed(6)),
                Number(event.lngLat.lat.toFixed(6)),
            ]);
        };

        map.on("click", handleClick);

        return () => {
            map.off("click", handleClick);
            map.getCanvas().style.cursor = "";
        };
    }, [isPickingLocation]);

    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        temporaryMarkerRef.current?.remove();
        temporaryMarkerRef.current = null;

        if (!pickedCoordinates) return;

        temporaryMarkerRef.current = new maplibregl.Marker({
            color: "#217F79",
            draggable: false,
        })
            .setLngLat(pickedCoordinates)
            .addTo(map);

        return () => {
            temporaryMarkerRef.current?.remove();
            temporaryMarkerRef.current = null;
        };
    }, [pickedCoordinates]);

    return (
        <div
            ref={mapContainer}
            className="h-full w-full"
            aria-label="City incident map"
        />
    );
}
