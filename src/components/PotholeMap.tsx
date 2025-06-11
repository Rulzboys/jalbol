
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pothole, UserLocation } from '@/pages/Index';

// Custom icons
const createPotholeIcon = (severity: 'low' | 'medium' | 'high') => {
  const colors = {
    low: '#22c55e',
    medium: '#f59e0b', 
    high: '#ef4444'
  };

  return L.divIcon({
    html: `
      <div style="
        width: 24px;
        height: 16px;
        background-color: ${colors[severity]};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        transform: perspective(10px) rotateX(20deg);
      "></div>
    `,
    className: 'custom-pothole-icon',
    iconSize: [24, 16],
    iconAnchor: [12, 8]
  });
};

const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        width: 16px;
        height: 16px;
        background-color: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      </style>
    `,
    className: 'custom-user-icon',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
};

interface MapUpdaterProps {
  center: UserLocation;
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.latitude, center.longitude], map.getZoom());
  }, [center, map]);

  return null;
};

interface PotholeMapProps {
  potholes: Pothole[];
  currentLocation: UserLocation | null;
  center: UserLocation;
}

export const PotholeMap: React.FC<PotholeMapProps> = ({ 
  potholes, 
  currentLocation, 
  center 
}) => {
  const severityLabels = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi'
  };

  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={15}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater center={center} />

      {/* Current user location */}
      {currentLocation && (
        <Marker
          position={[currentLocation.latitude, currentLocation.longitude]}
          icon={createUserIcon()}
        >
          <Popup>
            <div className="text-center">
              <strong>Lokasi Anda</strong>
              <br />
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              {currentLocation.accuracy && (
                <>
                  <br />
                  Akurasi: {Math.round(currentLocation.accuracy)}m
                </>
              )}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Potholes */}
      {potholes.map((pothole) => (
        <Marker
          key={pothole.id}
          position={[pothole.latitude, pothole.longitude]}
          icon={createPotholeIcon(pothole.severity)}
        >
          <Popup>
            <div className="text-center space-y-1">
              <strong>Jalan Berlubang</strong>
              <br />
              <span className={`px-2 py-1 rounded text-xs text-white ${
                pothole.severity === 'high' ? 'bg-red-500' :
                pothole.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                {severityLabels[pothole.severity]}
              </span>
              <br />
              <small>
                Dilaporkan: {pothole.reportCount}x
                <br />
                {new Date(pothole.timestamp).toLocaleDateString('id-ID')}
              </small>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
