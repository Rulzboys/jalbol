
import React, { useEffect, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { UserLocation } from '@/pages/Index';

interface LocationTrackerProps {
  isActive: boolean;
  onLocationUpdate: (location: UserLocation) => void;
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({ 
  isActive, 
  onLocationUpdate 
}) => {
  const watchIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isActive) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isActive]);

  const startTracking = async () => {
    try {
      // Request permissions
      const permissions = await Geolocation.requestPermissions();
      
      if (permissions.location === 'granted') {
        // Start watching position
        watchIdRef.current = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 3000
          },
          (position) => {
            if (position) {
              onLocationUpdate({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
            }
          }
        );
      } else {
        console.error('Location permission denied');
      }
    } catch (error) {
      console.error('Error starting location tracking:', error);
      
      // Fallback to browser geolocation
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            onLocationUpdate({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          (error) => {
            console.error('Browser geolocation error:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 3000
          }
        ).toString();
      }
    }
  };

  const stopTracking = async () => {
    if (watchIdRef.current) {
      try {
        await Geolocation.clearWatch({ id: watchIdRef.current });
      } catch (error) {
        // Fallback for browser geolocation
        if (navigator.geolocation) {
          navigator.geolocation.clearWatch(parseInt(watchIdRef.current));
        }
      }
      watchIdRef.current = null;
    }
  };

  return null; // This component doesn't render anything
};
