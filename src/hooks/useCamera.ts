import { useState, useCallback, useEffect, RefObject } from 'react';

export const useCamera = (videoRef: RefObject<HTMLVideoElement | null>, canvasRef: RefObject<HTMLCanvasElement | null>) => {
    const [userImage, setUserImage] = useState<string | null>(null);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

    const stopCamera = useCallback(() => {
        setIsCameraOn(false);
        setIsCameraReady(false);
    }, []);

    const startCamera = useCallback(() => {
        setUserImage(null);
        setIsCameraReady(false);
        setIsCameraOn(true);
    }, []);

    const toggleFacingMode = useCallback(() => {
        setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
    }, []);

    useEffect(() => {
        if (!isCameraOn) {
            return;
        }

        const videoElement = videoRef.current;
        if (!videoElement) {
            return;
        }

        let stream: MediaStream | null = null;
        setIsCameraReady(false);

        const enableStream = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: facingMode } });
                videoElement.srcObject = stream;
                
                videoElement.oncanplay = () => {
                    setIsCameraReady(true);
                };
                
                await videoElement.play();
            } catch (err) {
                console.error("Camera error:", err);
                stopCamera();
            }
        };

        enableStream();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (videoElement) {
                videoElement.srcObject = null;
                videoElement.oncanplay = null;
            }
        };
    }, [isCameraOn, facingMode, stopCamera, videoRef]);

    const takeSnapshot = useCallback(() => {
        if (videoRef.current && canvasRef.current && isCameraReady) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.save();
                if (facingMode === 'user') {
                    context.scale(-1, 1);
                    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
                } else {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                }
                context.restore();
                const dataUrl = canvas.toDataURL('image/jpeg');
                setUserImage(dataUrl);
            }
            stopCamera();
        }
    }, [isCameraReady, videoRef, canvasRef, stopCamera, facingMode]);
    
    const resetCamera = useCallback(() => {
        setUserImage(null);
        stopCamera();
    }, [stopCamera]);

    return {
        userImage,
        isCameraOn,
        isCameraReady,
        startCamera,
        stopCamera,
        takeSnapshot,
        resetCamera,
        toggleFacingMode,
        facingMode,
    };
};
