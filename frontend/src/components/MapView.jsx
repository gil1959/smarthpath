import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet markers not showing in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom premium markers
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [0, 0]
  });
};

const startIcon = createCustomIcon('#10b981'); // Emerald 500
const endIcon = createCustomIcon('#f43f5e');   // Rose 500

// Component to handle map clicks
const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// Component to fit map bounds to route
const RouteBounds = ({ routePoints }) => {
  const map = useMap();
  useEffect(() => {
    if (routePoints && routePoints.length > 0) {
      const bounds = L.latLngBounds(routePoints);
      // Adjust padding based on the sidebar (padding left 400px to avoid sidebar)
      map.fitBounds(bounds, { paddingTopLeft: [450, 50], paddingBottomRight: [50, 50] });
    }
  }, [routePoints, map]);
  return null;
};

const MapView = ({ startPoint, endPoint, onMapClick, routeData }) => {
  // Pusat peta di Bengkulu
  const defaultCenter = [-3.755, 102.270];
  
  let routePoints = [];
  if (routeData && routeData.geometry && routeData.geometry.coordinates) {
    routePoints = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);
  }

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        {/* Premium CartoDB Voyager basemap */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {/* Custom Positioned Zoom Control */}
        <ZoomControl position="bottomright" />

        <MapEvents onMapClick={onMapClick} />
        <RouteBounds routePoints={routePoints} />

        {startPoint && (
          <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
            <Popup className="premium-popup">Lokasi Awal</Popup>
          </Marker>
        )}

        {endPoint && (
          <Marker position={[endPoint.lat, endPoint.lng]} icon={endIcon}>
            <Popup className="premium-popup">Tujuan</Popup>
          </Marker>
        )}

        {routePoints.length > 0 && (
          <Polyline 
            positions={routePoints} 
            color="#4f46e5" // Indigo 600
            weight={6} 
            opacity={0.8}
            lineCap="round"
            lineJoin="round"
            className="animate-route"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
