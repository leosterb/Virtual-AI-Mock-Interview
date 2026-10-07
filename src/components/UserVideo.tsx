'use client';

import { useEffect, useRef, useState } from 'react';
import { User, MicOff, VideoOff } from 'lucide-react';

interface UserVideoProps {
  isMuted: boolean;
}

export function UserVideo({ isMuted }: UserVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    let disposed = false;
    let ownedStream: MediaStream | null = null;
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (disposed) { stream.getTracks().forEach(track => track.stop()); return; }
        ownedStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCamera(true);
        setHasPermission(true);
      } catch {
        if (disposed) return;
        setHasPermission(false);
        setHasCamera(false);
      }
    }

    setupCamera();

    return () => {
      disposed = true;
      ownedStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl overflow-hidden">
      {hasCamera && hasPermission ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {/* Mute overlay */}
          {isMuted && (
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
              <MicOff className="w-12 h-12 text-red-400" />
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
          <div className="w-32 h-32 rounded-full bg-slate-600 flex items-center justify-center mb-4">
            <User className="w-16 h-16 text-slate-400" />
          </div>
          {!hasPermission && (
            <div className="flex items-center gap-2 text-red-400">
              <VideoOff className="w-4 h-4" />
              <span className="text-sm">Camera access denied</span>
            </div>
          )}
        </div>
      )}

      {/* User label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/50 text-sm">
        You
      </div>
    </div>
  );
}