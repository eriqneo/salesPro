import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { X, Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStarting, setIsStarting] = useState(true);
  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        const videoInputDevices = await codeReader.current.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices[0].deviceId; // Default to first camera

        if (isMounted) {
          codeReader.current.decodeFromVideoDevice(
            selectedDeviceId,
            videoRef.current!,
            (result, err) => {
              if (result) {
                onScan(result.getText());
                onClose();
              }
            }
          );
          setIsStarting(false);
        }
      } catch (err) {
        console.error('Error starting barcode scanner:', err);
        onClose();
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      codeReader.current.reset();
    };
  }, [onScan, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="p-4 flex justify-between items-center bg-black/50 absolute top-0 left-0 right-0 z-10">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          <X className="w-6 h-6" />
        </Button>
        <span className="text-white font-bold text-sm uppercase tracking-widest">Scan Barcode</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full object-cover" />
        
        {/* Scanner Overlay */}
        <div className="absolute inset-0 border-[40px] border-black/40 flex items-center justify-center">
          <div className="w-64 h-48 border-2 border-primary relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary -mt-1 -ml-1" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary -mt-1 -mr-1" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary -mb-1 -ml-1" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary -mb-1 -mr-1" />
            
            {/* Scanning Line Animation */}
            <div className="absolute left-0 right-0 h-0.5 bg-primary/50 animate-scan" />
          </div>
        </div>

        {isStarting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="p-8 bg-black text-center">
        <p className="text-white/60 text-sm">Align barcode within the frame to scan</p>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
