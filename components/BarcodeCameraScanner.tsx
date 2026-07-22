"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import type { IScannerControls } from "@zxing/browser";
import { Button } from "@/components/ui/Button";

export function BarcodeCameraScanner({
  onDetected,
  onClose,
}: {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let cancelled = false;

    reader
      .decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } } },
        videoRef.current ?? undefined,
        (result, err) => {
          if (result) {
            onDetected(result.getText());
          } else if (err && !(err instanceof NotFoundException)) {
            // NotFoundException just means "no barcode in this frame" — it
            // fires continuously while scanning and isn't a real error.
            console.error("Barcode scan error", err);
          }
        }
      )
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error && err.name === "NotAllowedError"
            ? "Camera access was denied. Allow camera access in your browser settings, or enter the barcode manually below."
            : "Couldn't access the camera on this device. Enter the barcode manually below.";
        setError(message);
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-black">
      <div className="relative aspect-square w-full sm:aspect-video">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        {!error && (
          <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-white/70" />
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6">
            <p className="text-center text-sm text-white">{error}</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 bg-surface p-3">
        <p className="text-xs text-foreground-muted">
          {error ? "Camera unavailable" : "Point your camera at a barcode"}
        </p>
        <Button variant="secondary" size="sm" onClick={onClose} type="button">
          Cancel
        </Button>
      </div>
    </div>
  );
}
