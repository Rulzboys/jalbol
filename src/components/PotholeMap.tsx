
import React, { useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Pothole, UserLocation } from '@/pages/Index';

// Custom marker components
const PotholeMarker = ({ severity }: { severity: 'low' | 'medium' | 'high' }) => {
  const colors = {
    low: '#22c55e',
    medium: '#f59e0b', 
    high: '#ef4444'
  };

  return (
    <div 
      style={{
        width: 24,
        height: 16,
        backgroundColor: colors[severity],
        border: '2px solid white',
        borderRadius: '50%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        transform: 'perspective(10px) rotateX(20deg)',
        cursor: 'pointer'
      }}
    />
  );
};

const UserMarker = () => (
  <div 
    style={{
      width: 16,
      height: 16,
      backgroundColor: '#3b82f6',
      border: '3px solid white',
      borderRadius: '50%',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      animation: 'pulse 2s infinite',
      cursor: 'pointer'
    }}
  />
);

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
  const [viewState, setViewState] = useState({
    longitude: center.longitude,
    latitude: center.latitude,
    zoom: 15
  });

  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const severityLabels = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi'
  };

  // Update view when center changes
  React.useEffect(() => {
    setViewState(prev => ({
      ...prev,
      longitude: center.longitude,
      latitude: center.latitude
    }));
  }, [center]);

  const onMarkerClick = useCallback((pothole: Pothole) => {
    setSelectedPothole(pothole);
    setShowUserPopup(false);
  }, []);

  const onUserMarkerClick = useCallback(() => {
    setShowUserPopup(true);
    setSelectedPothole(null);
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }} className="relative">
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `}</style>
      
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={{
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }
          ]
        }}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      >
        <NavigationControl position="top-right" />

        {currentLocation && (
          <Marker
            longitude={currentLocation.longitude}
            latitude={currentLocation.latitude}
            onClick={onUserMarkerClick}
          >
            <UserMarker />
          </Marker>
        )}

        {potholes.map((pothole) => (
          <Marker
            key={pothole.id}
            longitude={pothole.longitude}
            latitude={pothole.latitude}
            onClick={() => onMarkerClick(pothole)}
          >
            <PotholeMarker severity={pothole.severity} />
          </Marker>
        ))}

        {selectedPothole && (
          <Popup
            longitude={selectedPothole.longitude}
            latitude={selectedPothole.latitude}
            onClose={() => setSelectedPothole(null)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="text-center space-y-1 p-2">
              <strong>Jalan Berlubang</strong>
              <br />
              <span className={`px-2 py-1 rounded text-xs text-white ${
                selectedPothole.severity === 'high' ? 'bg-red-500' :
                selectedPothole.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                {severityLabels[selectedPothole.severity]}
              </span>
              <br />
              <small>
                Dilaporkan: {selectedPothole.reportCount}x
                <br />
                {new Date(selectedPothole.timestamp).toLocaleDateString('id-ID')}
              </small>
            </div>
          </Popup>
        )}

        {showUserPopup && currentLocation && (
          <Popup
            longitude={currentLocation.longitude}
            latitude={currentLocation.latitude}
            onClose={() => setShowUserPopup(false)}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="text-center p-2">
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
        )}
      </Map>
    </div>
  );
};
