import { useState, useCallback, useEffect, RefObject } from "react";
import { useNotification } from "./useNotification";
import { useTranslation } from "./useTranslation";

export const useCamera = (
  videoRef: RefObject<HTMLVideoElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
) => {
  const { addNotification } = useNotification();
  const { t } = useTranslation();

  const [userImage, setUserImage] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

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
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
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
    // When switching cameras, ensure ready state is false until new stream is ready
    setIsCameraReady(false);

    const enableStream = async () => {
      try {
        // Stop any existing stream before getting a new one
        if (videoElement.srcObject) {
          (videoElement.srcObject as MediaStream)
            .getTracks()
            .forEach((track) => track.stop());
        }

        // FIX: Removed specific width/height constraints to improve compatibility and reduce 'NotFoundError'.
        // The browser will now select a suitable default resolution.
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
        });
        videoElement.srcObject = stream;

        videoElement.oncanplay = () => {
          setIsCameraReady(true);
        };

        await videoElement.play();
      } catch (err) {
        console.error("Camera error:", err);
        let errorMessage = "vto_error_cameraAccess";
        if (err instanceof DOMException) {
          if (err.name === "NotAllowedError")
            errorMessage = "vto_error_cameraPermission";
          else if (
            err.name === "NotFoundError" ||
            err.name === "NotReadableError"
          )
            errorMessage = "vto_error_cameraStart";
        }
        addNotification({
          type: "error",
          title: t("vto_error_title"),
          message: t(errorMessage),
        });
        stopCamera();
      }
    };

    enableStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (videoElement) {
        videoElement.srcObject = null;
        videoElement.oncanplay = null;
      }
    };
  }, [isCameraOn, facingMode, addNotification, stopCamera, t, videoRef]);

  const takeSnapshot = useCallback(() => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.save();
        // Flip the image if it's the front camera to match the mirrored preview
        if (facingMode === "user") {
          context.scale(-1, 1);
          context.drawImage(
            video,
            -canvas.width,
            0,
            canvas.width,
            canvas.height,
          );
        } else {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        context.restore();
        const dataUrl = canvas.toDataURL("image/jpeg");
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
