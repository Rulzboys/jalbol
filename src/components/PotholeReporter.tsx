
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, MapPin } from "lucide-react";
import { UserLocation } from '@/pages/Index';

interface PotholeReporterProps {
  currentLocation: UserLocation | null;
  onReport: (location: UserLocation, severity: 'low' | 'medium' | 'high') => void;
  disabled?: boolean;
}

export const PotholeReporter: React.FC<PotholeReporterProps> = ({
  currentLocation,
  onReport,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<'low' | 'medium' | 'high'>('medium');

  const handleReport = () => {
    if (currentLocation) {
      onReport(currentLocation, selectedSeverity);
      setIsOpen(false);
    }
  };

  const severityOptions = [
    { value: 'low' as const, label: 'Rendah', description: 'Lubang kecil, tidak terlalu berbahaya', color: 'bg-green-500' },
    { value: 'medium' as const, label: 'Sedang', description: 'Lubang sedang, perlu hati-hati', color: 'bg-yellow-500' },
    { value: 'high' as const, label: 'Tinggi', description: 'Lubang besar, sangat berbahaya', color: 'bg-red-500' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="flex-1"
          variant="outline"
          disabled={disabled}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Laporkan Jalan Bolong
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Laporkan Jalan Berlubang
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {currentLocation && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Lokasi saat ini:</p>
              <p className="font-mono text-xs">
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm font-medium">Pilih tingkat keparahan:</p>
            
            {severityOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <input
                  type="radio"
                  id={option.value}
                  name="severity"
                  value={option.value}
                  checked={selectedSeverity === option.value}
                  onChange={(e) => setSelectedSeverity(e.target.value as 'low' | 'medium' | 'high')}
                  className="sr-only"
                />
                <label
                  htmlFor={option.value}
                  className={`flex-1 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSeverity === option.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-3 rounded-full ${option.color}`}></div>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              onClick={handleReport}
              className="flex-1"
              disabled={!currentLocation}
            >
              Kirim Laporan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
