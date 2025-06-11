
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertTriangle, Navigation, Users } from "lucide-react";
import { PotholeMap } from "@/components/PotholeMap";
import { LocationTracker } from "@/components/LocationTracker";
import { PotholeReporter } from "@/components/PotholeReporter";
import { AuthSection } from "@/components/AuthSection";
import { useToast } from "@/hooks/use-toast";

export interface Pothole {
  id: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high';
  reportedBy: string;
  timestamp: string;
  reportCount: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

const Index = () => {
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const { toast } = useToast();

  // Sample pothole data - in real app this would come from Supabase
  const samplePotholes: Pothole[] = [
    {
      id: '1',
      latitude: -6.2088,
      longitude: 106.8456,
      severity: 'high',
      reportedBy: 'user@example.com',
      timestamp: new Date().toISOString(),
      reportCount: 5
    },
    {
      id: '2',
      latitude: -6.2100,
      longitude: 106.8470,
      severity: 'medium',
      reportedBy: 'user2@example.com',
      timestamp: new Date().toISOString(),
      reportCount: 3
    }
  ];

  useEffect(() => {
    setPotholes(samplePotholes);
  }, []);

  const handleLocationUpdate = (location: UserLocation) => {
    setCurrentLocation(location);
    
    // Check for nearby potholes within 20 meters
    if (potholes.length > 0) {
      checkNearbyPotholes(location);
    }
  };

  const checkNearbyPotholes = (location: UserLocation) => {
    potholes.forEach((pothole) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        pothole.latitude,
        pothole.longitude
      );

      if (distance <= 20) { // 20 meter radius
        showPotholeAlert(pothole, distance);
      }
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const showPotholeAlert = (pothole: Pothole, distance: number) => {
    const severityText = {
      low: 'Rendah',
      medium: 'Sedang',
      high: 'Tinggi'
    };

    toast({
      title: "⚠️ Peringatan Jalan Berlubang!",
      description: `Jalan berlubang terdeteksi ${Math.round(distance)}m di depan. Tingkat: ${severityText[pothole.severity]}`,
      variant: "destructive",
    });
  };

  const handleReportPothole = (location: UserLocation, severity: 'low' | 'medium' | 'high') => {
    if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login dengan Google untuk melaporkan jalan berlubang.",
        variant: "destructive",
      });
      return;
    }

    const newPothole: Pothole = {
      id: Date.now().toString(),
      latitude: location.latitude,
      longitude: location.longitude,
      severity,
      reportedBy: user.email,
      timestamp: new Date().toISOString(),
      reportCount: 1
    };

    setPotholes(prev => [...prev, newPothole]);
    
    toast({
      title: "✅ Laporan Berhasil",
      description: "Terima kasih telah melaporkan jalan berlubang!",
    });
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    if (!isTracking) {
      toast({
        title: "GPS Tracking Aktif",
        description: "Sistem akan memantau lokasi Anda dan memberikan peringatan jalan berlubang.",
      });
    } else {
      toast({
        title: "GPS Tracking Dinonaktifkan",
        description: "Peringatan jalan berlubang dihentikan.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6" />
            <h1 className="text-xl font-bold">Pothole Alert ID</h1>
          </div>
          <AuthSection user={user} onUserChange={setUser} />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Tracking</CardTitle>
              <Navigation className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isTracking ? "Aktif" : "Nonaktif"}
              </div>
              <p className="text-xs text-muted-foreground">
                GPS monitoring status
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lubang</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{potholes.length}</div>
              <p className="text-xs text-muted-foreground">
                Terdaftar di database
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user ? "Login" : "Guest"}
              </div>
              <p className="text-xs text-muted-foreground">
                Status akun
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={toggleTracking} 
            className="flex-1"
            variant={isTracking ? "destructive" : "default"}
          >
            {isTracking ? "Stop Tracking" : "Start GPS Tracking"}
          </Button>
          
          <PotholeReporter 
            currentLocation={currentLocation}
            onReport={handleReportPothole}
            disabled={!currentLocation || !user}
          />
        </div>

        {/* Location Info */}
        {currentLocation && (
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Lokasi saat ini: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              {currentLocation.accuracy && ` (akurasi: ${Math.round(currentLocation.accuracy)}m)`}
            </AlertDescription>
          </Alert>
        )}

        {/* Map */}
        <Card>
          <CardHeader>
            <CardTitle>Peta Jalan Berlubang</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-96 w-full">
              <PotholeMap 
                potholes={potholes}
                currentLocation={currentLocation}
                center={currentLocation || { latitude: -6.2088, longitude: 106.8456 }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Tracker Component */}
      <LocationTracker 
        isActive={isTracking}
        onLocationUpdate={handleLocationUpdate}
      />
    </div>
  );
};

export default Index;
