import React, { useState, useRef } from "react";
import { useCamera } from "../hooks/useCamera";
import { useHairstyle } from "../hooks/useHairstyle";

const VirtualTryOn: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [userImage, setUserImage] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

  const {
    userImage: cameraImage,
    isCameraOn,
    isCameraReady,
    startCamera,
    stopCamera,
    takeSnapshot,
    resetCamera,
    facingMode,
    toggleFacingMode,
  } = useCamera(videoRef, canvasRef);

  const {
    generatedImage,
    isLoading,
    loadingMessage,
    applyHairstyle,
    resetHairstyle,
  } = useHairstyle();

  React.useEffect(() => {
    if (cameraImage) {
      setUserImage(cameraImage);
    }
  }, [cameraImage]);

  const handleSelectStyle = (prompt: string) => {
    if (userImage) {
      applyHairstyle(userImage, prompt, "custom");
    } else {
      startCamera();
    }
  };

  const handleStartOver = () => {
    setUserImage(null);
    resetCamera();
    resetHairstyle();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-lg p-8 mx-auto text-center">
        <div className="mb-4 progress-track">
          <div className="progress-bar" style={{ width: "50%" }}></div>
        </div>
        <p className="mt-6 text-lg text-black dark:text-white animate-pulse">
          {loadingMessage}
        </p>
      </div>
    );
  }

  if (isCameraOn) {
    return (
      <div className="w-full max-w-3xl p-4 mx-auto text-center glass-panel md:p-6">
        <div className="relative w-full overflow-hidden rounded-lg aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === "user" ? "transform -scale-x-100" : ""}`}
          ></video>
          {!isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="w-12 h-12 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}
          {isCameraReady && (
            <button
              onClick={toggleFacingMode}
              className="absolute z-10 p-2 text-white transition-all rounded-full top-4 right-4 bg-black/50 hover:bg-black/70"
              aria-label="Flip camera"
            >
              Flip
            </button>
          )}
        </div>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={takeSnapshot}
            disabled={!isCameraReady}
            className="px-4 py-2 text-base text-white bg-blue-500 rounded"
          >
            Take Photo
          </button>
          <button
            onClick={stopCamera}
            className="px-8 py-3 text-base font-bold tracking-wider text-black uppercase transition-colors bg-gray-200 rounded-full dark:bg-white/10 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (generatedImage && userImage) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-2 md:gap-10">
          <div className="p-4 text-center glass-panel">
            <h3 className="mb-4 font-serif text-3xl font-bold text-black dark:text-white">
              Before
            </h3>
            <img
              src={userImage}
              alt="Before"
              className="object-cover w-full max-w-md mx-auto rounded-lg shadow-2xl aspect-square"
            />
          </div>
          <div className="p-4 text-center glass-panel">
            <h3 className="mb-4 font-serif text-3xl font-bold text-black dark:text-white">
              After
            </h3>
            <img
              src={generatedImage}
              alt="After"
              className="object-cover w-full max-w-md mx-auto rounded-lg shadow-2xl aspect-square"
            />
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 !bg-black/80 dark:!bg-white/90 !text-white dark:!text-black !font-bold !py-2.5 !px-6 !rounded-full"
          >
            Save
          </button>
          <button
            onClick={handleStartOver}
            className="flex items-center gap-2 bg-gray-200 dark:bg-white/10 text-black dark:text-white font-bold py-2.5 px-6 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-transform hover:scale-105"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (userImage) {
    return (
      <div className="w-full max-w-xl p-6 mx-auto text-center glass-panel md:p-8">
        <img
          src={userImage}
          alt="User snapshot"
          className="w-full max-w-xs mx-auto rounded-lg shadow-2xl"
        />
        <div className="flex items-center justify-center gap-4 mx-auto mt-6">
          <button
            onClick={startCamera}
            className="flex items-center gap-2 text-sm text-gray-500 transition-colors dark:text-gray-400 hover:text-black dark:hover:text-white"
          >
            Retake
          </button>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-200 dark:border-white/10">
          <h4 className="mb-4 font-serif text-xl font-bold text-black dark:text-white">
            Custom Prompt
          </h4>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Describe your desired hairstyle
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., blonde waves"
              className="flex-grow form-input"
            />
            <button
              onClick={() => handleSelectStyle(customPrompt)}
              disabled={isLoading || !customPrompt.trim()}
              className="!py-3 !px-6 text-sm flex-shrink-0 bg-blue-500 text-white rounded"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto text-center">
      <div className="border-2 border-blue-400/50 dark:border-blue-500/70 rounded-lg p-4 min-h-[300px] flex items-center justify-center glass-panel !bg-opacity-20 dark:!bg-opacity-30 shadow-inner">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Click to start camera
        </p>
      </div>
      <button
        onClick={startCamera}
        className="px-4 py-2 mt-6 text-base text-white bg-blue-500 rounded"
      >
        Start Camera
      </button>
    </div>
  );
};

export default VirtualTryOn;
