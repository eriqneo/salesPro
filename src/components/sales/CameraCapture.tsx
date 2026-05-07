import React, { useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const startCamera = useCallback(async () => {
    setIsStarting(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast.error("Could not access camera. Please check permissions.");
      onClose();
    } finally {
      setIsStarting(false);
    }
  }, [onClose]);

  React.useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const capture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
    }
  };

  const confirmCapture = () => {
    if (!capturedImage) return;
    
    // Convert dataUrl to Blob
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        onCapture(blob);
        onClose();
      });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
            <X className="w-6 h-6" />
          </Button>
          <span className="text-white font-bold text-sm uppercase tracking-widest">
            {capturedImage ? 'Review Photo' : 'Capture Photo'}
          </span>
          <div className="w-10" />
        </div>

        {/* Viewport */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          {!capturedImage ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-cover"
            />
          )}
          
          {isStarting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-8 bg-black flex justify-center items-center gap-8">
          {!capturedImage ? (
            <button 
              onClick={capture}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setCapturedImage(null)}
                className="rounded-full border-white text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Retake
              </Button>
              <Button 
                size="lg" 
                onClick={confirmCapture}
                className="rounded-full bg-white text-black hover:bg-slate-200 px-8"
              >
                <Check className="w-4 h-4 mr-2" /> Use Photo
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
