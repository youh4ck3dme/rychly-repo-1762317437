import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../lib/i18n.tsx';

interface FaceDetectionResult {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

interface ARCameraProps {
  isVisible: boolean;
  onClose: () => void;
  selectedHairstyle?: string;
  selectedColor?: string;
}

export const ARCamera: React.FC<ARCameraProps> = ({
  isVisible,
  onClose,
  selectedHairstyle = 'longLayers',
  selectedColor = '#8B4513'
}) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();

  const [isStreaming, setIsStreaming] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [hairOverlay, setHairOverlay] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load hair overlay image based on selected style and color
  useEffect(() => {
    if (selectedHairstyle && selectedColor) {
      loadHairOverlay(selectedHairstyle, selectedColor);
    }
  }, [selectedHairstyle, selectedColor]);

  const loadHairOverlay = useCallback(async (style: string, color: string) => {
    try {
      // Generate hair overlay using canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Create hair overlay based on style
      canvas.width = 200;
      canvas.height = 150;

      // Draw hair shape based on style
      ctx.fillStyle = color;
      ctx.beginPath();

      switch (style) {
        case 'bob':
          // Bob haircut shape
          ctx.ellipse(100, 75, 80, 60, 0, 0, Math.PI * 2);
          break;
        case 'longLayers':
          // Long layers shape
          ctx.ellipse(100, 90, 85, 80, 0, 0, Math.PI * 2);
          break;
        case 'pixie':
          // Pixie cut shape
          ctx.ellipse(100, 60, 60, 40, 0, 0, Math.PI * 2);
          break;
        default:
          // Default long hair
          ctx.ellipse(100, 90, 85, 80, 0, 0, Math.PI * 2);
      }

      ctx.fill();

      // Convert to image
      const image = new Image();
      image.onload = () => setHairOverlay(image);
      image.src = canvas.toDataURL();
    } catch (err) {
      console.error('Error loading hair overlay:', err);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);

        // Start face detection loop
        startFaceDetection();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Nepodarilo sa spustiť kameru. Skúste to znovu.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setFaceDetected(false);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const startFaceDetection = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const detectFace = () => {
      if (!video.videoWidth || !video.videoHeight) {
        animationRef.current = requestAnimationFrame(detectFace);
        return;
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame
      ctx.drawImage(video, 0, 0);

      // Simple face detection simulation (in real app, use MediaPipe or similar)
      const faceResult = detectFaceInFrame(video);

      if (faceResult) {
        setFaceDetected(true);

        // Draw face detection box
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.strokeRect(faceResult.x, faceResult.y, faceResult.width, faceResult.height);

        // Draw hair overlay if available
        if (hairOverlay) {
          const hairX = faceResult.x + (faceResult.width * 0.1);
          const hairY = faceResult.y - (faceResult.height * 0.3);
          const hairWidth = faceResult.width * 0.8;
          const hairHeight = faceResult.height * 0.6;

          ctx.save();
          ctx.globalAlpha = 0.8;
          ctx.drawImage(
            hairOverlay,
            hairX, hairY, hairWidth, hairHeight
          );
          ctx.restore();
        }

        // Draw info overlay
        drawInfoOverlay(ctx, faceResult);
      } else {
        setFaceDetected(false);
      }

      animationRef.current = requestAnimationFrame(detectFace);
    };

    detectFace();
  }, [hairOverlay]);

  const detectFaceInFrame = (video: HTMLVideoElement): FaceDetectionResult | null => {
    // Simplified face detection - in production, use proper face detection library
    const width = video.videoWidth;
    const height = video.videoHeight;

    // Simulate face detection in center area
    const centerX = width / 2;
    const centerY = height / 2;

    // Mock face detection result
    return {
      x: centerX - 100,
      y: centerY - 120,
      width: 200,
      height: 240,
      confidence: 0.85
    };
  };

  const drawInfoOverlay = (ctx: CanvasRenderingContext2D, face: FaceDetectionResult) => {
    // Draw detection info
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 300, 120);

    ctx.fillStyle = '#FFD700';
    ctx.font = '16px Arial';
    ctx.fillText(`Face Detected: ${faceDetected ? '✓' : '✗'}`, 20, 30);
    ctx.fillText(`Confidence: ${Math.round(face.confidence * 100)}%`, 20, 50);
    ctx.fillText(`Hairstyle: ${selectedHairstyle}`, 20, 70);
    ctx.fillText(`Color: ${selectedColor}`, 20, 90);
    ctx.fillText('AR Mode: Active', 20, 110);
  };

  const captureResult = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `papi-ar-result-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  useEffect(() => {
    if (isVisible) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isVisible, startCamera, stopCamera]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Camera View */}
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />

            {/* AR Overlay Info */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 text-white">
                <div className={`w-3 h-3 rounded-full ${faceDetected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
                <span className="text-sm font-medium">
                  {faceDetected ? 'Face Detected - AR Active' : 'Looking for face...'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={captureResult}
                className="bg-gradient-to-r from-amber-400 to-amber-600 text-black px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
              >
                📸 Capture Result
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="bg-gray-800/80 backdrop-blur-sm text-white px-6 py-3 rounded-full font-bold border border-gray-600 hover:bg-gray-700/80 transition-all"
              >
                ❌ Close AR
              </motion.button>
            </div>

            {/* Hair Style Selector */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
              <div className="text-white text-sm space-y-2">
                <div>
                  <span className="text-amber-400">Style:</span> {selectedHairstyle}
                </div>
                <div>
                  <span className="text-amber-400">Color:</span>
                  <div
                    className="w-4 h-4 rounded-full inline-block ml-2 border-2 border-white"
                    style={{ backgroundColor: selectedColor }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p>Processing AR...</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="absolute inset-0 bg-red-900/20 flex items-center justify-center">
                <div className="text-center text-white bg-red-900/80 p-6 rounded-lg">
                  <p className="font-bold text-red-200">Camera Error</p>
                  <p className="text-sm text-red-300 mt-2">{error}</p>
                  <button
                    onClick={startCamera}
                    className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};