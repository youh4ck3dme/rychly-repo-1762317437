import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { hairstylesData } from "../constants";
import { isAiAvailable } from "../services/geminiService";
import { useNotification } from "../hooks/useNotification";
import { useCamera } from "../hooks/useCamera";
import { useHairstyle } from "../hooks/useHairstyle";
import { useAuth } from "../context/AuthContext";
import {
  createShareSession,
  uploadImageForSharing,
} from "../services/sharingService";
import FancyButton from "./common/FancyButton";
import IntroAnimation from "./IntroAnimation";

// Redesigned SVG Icons for a premium "Studio" feel
const CameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const RetakeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.5 2v6h-6" />
    <path d="M2.5 22v-6h6" />
    <path d="M22 11.5A10 10 0 0 0 3.5 12.5" />
    <path d="M2 12.5a10 10 0 0 0 18.5-1" />
  </svg>
);

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
    />
  </svg>
);

const InviteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="16" y1="11" x2="22" y2="11" />
  </svg>
);

const StartOverIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662a49.471 49.471 0 007.5 0c2.688 0 5.162-.38 7.5 0zM19.5 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM12 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
    />
  </svg>
);

const FlipCameraIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4" />
    <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);

const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.028C18.343 21.128 22 16.991 22 12z"></path>
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const HairstyleCard: React.FC<{
  style: (typeof hairstylesData)[0];
  onSelect: () => void;
  isBusy: boolean;
  isSelected: boolean;
}> = ({ style, onSelect, isBusy, isSelected }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col overflow-hidden transition-all duration-300 group glass-panel hover:shadow-2xl hover:-translate-y-2">
      <div className="relative aspect-square">
        <img
          src={style.image}
          alt={t(`style_${style.id}_name`)}
          className="object-cover w-full h-full rounded-t-lg"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/60 via-black/20 to-transparent sm:p-3">
          <h3
            className="text-base font-bold text-white font-display sm:text-lg"
            style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.8)" }}
          >
            {t(`style_${style.id}_name`)}
          </h3>
        </div>
      </div>
      <div className="flex flex-col flex-grow p-4 text-center">
        <p className="flex-grow text-sm text-gray-600 dark:text-gray-300">
          {t(style.descriptionId)}
        </p>
        <FancyButton
          onClick={onSelect}
          disabled={isBusy}
          className="w-full mt-4 !bg-black/80 dark:!bg-white/90 !text-white dark:!text-black !font-semibold !py-2.5 !px-4 !rounded-full text-sm uppercase tracking-wider"
        >
          {isSelected ? (
            <div className="w-5 h-5 mx-auto border-2 border-current rounded-full border-t-transparent animate-spin"></div>
          ) : (
            t("vto_try")
          )}
        </FancyButton>
      </div>
    </div>
  );
};

const VirtualTryOn: React.FC<{ sharedImage?: string }> = ({ sharedImage }) => {
  const { t } = useTranslation();
  const { addNotification } = useNotification();
  const { logout, isDevMode, devCredits } = useAuth();
  const isSharedSession = !!sharedImage;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [userImage, setUserImage] = useState<string | null>(
    sharedImage || null,
  );
  const [isSharing, setIsSharing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUploadingForShare, setIsUploadingForShare] = useState(false);

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

  useEffect(() => {
    if (cameraImage) {
      setUserImage(cameraImage);
    }
  }, [cameraImage]);

  const {
    generatedImage,
    isLoading,
    loadingMessage,
    selectedHairstyleId,
    applyHairstyle,
    resetHairstyle,
    progress,
  } = useHairstyle();

  const handleStartCameraClick = () => {
    if (isSharedSession) return;
    resetHairstyle();
    setUserImage(null);
    resetCamera();
    startCamera();
  };

  const handleSelectStyle = (prompt: string, styleId: string) => {
    if (userImage) {
      applyHairstyle(userImage, prompt, styleId);
    } else if (!isSharedSession) {
      handleStartCameraClick();
    }
  };

  const handleRefineClick = () => {
    if (generatedImage && refinePrompt.trim()) {
      applyHairstyle(generatedImage, refinePrompt.trim(), "refine");
    }
  };

  const handleStartOver = () => {
    if (isSharedSession) {
      resetHairstyle();
    } else {
      setUserImage(null);
      resetCamera();
      resetHairstyle();
    }
  };

  const handleSave = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = "papi-hair-design-try-on.jpeg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleGenericShare = async () => {
    if (generatedImage) {
      try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const file = new File([blob], "hairstyle.jpeg", { type: "image/jpeg" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: t("vto_shareTitle"),
            text: t("vto_shareText"),
            files: [file],
            url: window.location.origin, // Share a link back to the app
          });
        } else {
          addNotification({
            type: "error",
            title: t("vto_error_title"),
            message: t("vto_error_shareUnsupported"),
          });
        }
      } catch (error) {
        console.error("Share failed:", error);
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          addNotification({
            type: "error",
            title: t("vto_error_title"),
            message: t("vto_error_shareFailed"),
          });
        }
      }
    }
  };

  const handlePlatformShare = async (platform: "facebook" | "twitter") => {
    if (!generatedImage || isUploadingForShare) return;

    setIsUploadingForShare(true);
    addNotification({
      type: "info",
      title: t("vto_info_title"),
      message: t("vto_uploading_for_share"),
      duration: 10000,
    });
    const imageUrl = await uploadImageForSharing(generatedImage);
    setIsUploadingForShare(false);

    if (!imageUrl) {
      addNotification({
        type: "error",
        title: t("vto_error_title"),
        message: t("vto_error_shareSessionFailed"),
      });
      return;
    }

    const appUrl = window.location.origin;
    const shareText = `${t("vto_shareText")} ${appUrl}`;
    let platformUrl = "";

    if (platform === "facebook") {
      platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(shareText)}`;
    } else if (platform === "twitter") {
      platformUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(shareText)}`;
    }

    window.open(platformUrl, "_blank", "noopener,noreferrer");
  };

  const handleInviteFriend = async () => {
    if (isDevMode || !userImage || isSharing) return;

    setIsSharing(true);
    const sessionId = await createShareSession(userImage);
    setIsSharing(false);

    if (sessionId) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?session=${sessionId}`;
      const shareData = {
        title: t("vto_shareSessionTitle"),
        text: t("vto_shareSessionText"),
        url: shareUrl,
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(shareUrl);
          addNotification({
            type: "success",
            title: t("vto_shareSessionLinkCopied_title"),
            message: t("vto_shareSessionLinkCopied_message"),
          });
        }
      } catch (error) {
        console.error("Sharing failed", error);
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          addNotification({
            type: "error",
            title: t("vto_error_title"),
            message: t("vto_error_shareFailed"),
          });
        }
      }
    } else {
      addNotification({
        type: "error",
        title: t("vto_error_title"),
        message: t("vto_error_shareSessionFailed"),
      });
    }
  };

  if (!isAiAvailable) {
    return (
      <section id="virtual-try-on" className="py-24 sm:py-32">
        <div className="container p-10 px-4 mx-auto text-center sm:px-6 lg:px-8 glass-panel">
          <h2 className="font-serif text-5xl font-bold text-black md:text-6xl dark:text-white">
            {t("vto_unavailable_title")}
          </h2>
          <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-600 dark:text-gray-400">
            {t("vto_unavailable_subtitle")}
          </p>
        </div>
      </section>
    );
  }

  const renderInteractiveArea = () => {
    if (isLoading) {
      return (
        <div className="w-full max-w-lg p-8 mx-auto text-center">
          <div className="mb-4 progress-track">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
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
                aria-label={t("vto_button_flipCamera")}
              >
                <FlipCameraIcon className="w-6 h-6" />
              </button>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <FancyButton
              onClick={takeSnapshot}
              disabled={!isCameraReady}
              className="text-base"
            >
              <CameraIcon className="inline-block w-6 h-6 mr-2" />{" "}
              {t("vto_button_takeSnapshot")}
            </FancyButton>
            <button
              onClick={stopCamera}
              className="px-8 py-3 text-base font-bold tracking-wider text-black uppercase transition-colors bg-gray-200 rounded-full dark:bg-white/10 dark:text-white hover:bg-gray-300 dark:hover:bg-white/20"
            >
              {t("vto_button_cancel")}
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
                {t("vto_before")}
              </h3>
              <img
                src={userImage}
                alt="Before"
                className="object-cover w-full max-w-md mx-auto rounded-lg shadow-2xl aspect-square"
              />
            </div>
            <div className="p-4 text-center glass-panel">
              <h3 className="mb-4 font-serif text-3xl font-bold text-black dark:text-white">
                {t("vto_after")}
              </h3>
              <img
                src={generatedImage}
                alt="After"
                className="object-cover w-full max-w-md mx-auto rounded-lg shadow-2xl aspect-square"
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <FancyButton
              onClick={handleSave}
              className="flex items-center gap-2 !bg-black/80 dark:!bg-white/90 !text-white dark:!text-black !font-bold !py-2.5 !px-6 !rounded-full"
            >
              <SaveIcon className="w-5 h-5" /> {t("vto_button_save")}
            </FancyButton>
            {navigator.share && !isDevMode && (
              <FancyButton
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 !bg-black/80 dark:!bg-white/90 !text-white dark:!text-black !font-bold !py-2.5 !px-6 !rounded-full"
              >
                <ShareIcon className="w-5 h-5" /> {t("vto_button_share")}
              </FancyButton>
            )}
            <button
              onClick={handleStartOver}
              className="flex items-center gap-2 bg-gray-200 dark:bg-white/10 text-black dark:text-white font-bold py-2.5 px-6 rounded-full hover:bg-gray-300 dark:hover:bg-white/20 transition-transform hover:scale-105"
            >
              <StartOverIcon className="w-5 h-5" /> {t("vto_button_startOver")}
            </button>
          </div>

          <div className="max-w-2xl p-6 mx-auto mt-10 glass-panel md:p-8">
            <h4 className="mb-4 font-serif text-xl font-bold text-black dark:text-white">
              {t("vto_refine_title")}
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {t("vto_refine_subtitle")}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
                placeholder={t("vto_refine_placeholder")}
                className="flex-grow form-input"
                aria-label={t("vto_refine_title")}
              />
              <FancyButton
                onClick={handleRefineClick}
                disabled={isLoading || !refinePrompt.trim()}
                className="!py-3 !px-6 text-sm flex-shrink-0"
              >
                {selectedHairstyleId === "refine" ? (
                  <div className="w-5 h-5 mx-auto border-2 border-black rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  t("vto_refine_button")
                )}
              </FancyButton>
            </div>
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
            {!isSharedSession && (
              <button
                onClick={handleStartCameraClick}
                className="flex items-center gap-2 text-sm text-gray-500 transition-colors dark:text-gray-400 hover:text-black dark:hover:text-white"
              >
                <RetakeIcon className="w-4 h-4" /> {t("vto_button_retake")}
              </button>
            )}
            <button
              onClick={handleInviteFriend}
              disabled={isSharing || isDevMode}
              className="flex items-center gap-2 text-sm text-gray-500 transition-colors dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-50 disabled:cursor-wait"
            >
              {isSharing ? (
                <div className="w-4 h-4 border-2 rounded-full border-t-transparent animate-spin"></div>
              ) : (
                <InviteIcon className="w-4 h-4" />
              )}
              {t("vto_button_invite")}
            </button>
          </div>

          <div className="pt-8 mt-8 border-t border-gray-200 dark:border-white/10">
            <h4 className="mb-4 font-serif text-xl font-bold text-black dark:text-white">
              {t("vto_customPrompt_title")}
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {t("vto_customPrompt_subtitle")}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={t("vto_customPrompt_placeholder")}
                className="flex-grow form-input"
                aria-label={t("vto_customPrompt_title")}
              />
              <FancyButton
                onClick={() => handleSelectStyle(customPrompt, "custom")}
                disabled={isLoading || !customPrompt.trim()}
                className="!py-3 !px-6 text-sm flex-shrink-0"
              >
                {selectedHairstyleId === "custom" ? (
                  <div className="w-5 h-5 mx-auto border-2 border-black rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  t("vto_customPrompt_button")
                )}
              </FancyButton>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-3xl mx-auto text-center">
        <div className="border-2 border-blue-400/50 dark:border-blue-500/70 rounded-lg p-4 min-h-[300px] flex items-center justify-center glass-panel !bg-opacity-20 dark:!bg-opacity-30 shadow-inner">
          <IntroAnimation />
        </div>
        <p className="max-w-2xl mx-auto mt-8 text-lg text-gray-600 dark:text-gray-400">
          {t("vto_activateCameraPrompt")}
        </p>
        <div className="flex flex-col gap-4 mt-6">
          <FancyButton
            onClick={handleStartCameraClick}
            className="text-base"
          >
            {t("vto_button_startCamera")}
          </FancyButton>
          <button
            onClick={() => window.open('https://papi-hair-design.vercel.app', '_blank')}
            className="text-sm btn-primary"
          >
            PAPI HAIR STUDIO
          </button>
        </div>
      </div>
    );
  };

  const renderCatalogTitle = () => {
    if (userImage && !generatedImage) {
      return t("vto_nowChooseStyle");
    }
    if (generatedImage) {
      return t("vto_tryAnotherStyle");
    }
    return t("vto_catalogTitle");
  };

  let viewState = "initial";
  if (isLoading) viewState = "loading";
  else if (isCameraOn) viewState = "camera";
  else if (generatedImage) viewState = "result";
  else if (userImage) viewState = "userImage";

  return (
    <section
      id="virtual-try-on"
      className="relative py-24 overflow-hidden sm:py-32"
    >
      {!isSharedSession && (
        <button
          onClick={logout}
          className="absolute top-6 right-6 z-10 glass-panel !bg-black/20 dark:!bg-white/10 text-white font-bold py-2 px-4 !rounded-full text-xs uppercase tracking-wider hover:!bg-black/40 dark:hover:!bg-white/20 transition-colors"
          aria-label={t("vto_logout_button")}
        >
          {t("vto_logout_button")}
        </button>
      )}
      {isDevMode && devCredits !== null && (
        <div className="absolute top-6 left-6 z-10 glass-panel !bg-black/20 dark:!bg-white/10 text-white font-bold py-2 px-4 !rounded-full text-xs uppercase tracking-wider">
          Credits remaining: {devCredits}
        </div>
      )}
      <div className="container px-4 mx-auto sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <h2
            className="font-serif text-5xl font-bold text-black md:text-6xl dark:text-white"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
          >
            {t("vto_title")}
          </h2>
          {!userImage && !isCameraOn && (
            <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-600 dark:text-gray-400">
              {t("vto_subtitle")}
            </p>
          )}
        </div>

        <div
          className="flex items-center justify-center min-h-[500px]"
          style={{ perspective: "1000px" }}
        >
          <div key={viewState} className="w-full animate-flip-in">
            {renderInteractiveArea()}
          </div>
        </div>

        {!isCameraOn && !isLoading && (
          <div className="w-full mt-20">
            <div className="mb-12 text-center">
              <h3 className="font-serif text-4xl font-bold text-black dark:text-white">
                {renderCatalogTitle()}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-6 mx-auto sm:grid-cols-3 lg:grid-cols-4 lg:gap-8 max-w-7xl">
              {hairstylesData.map((style) => (
                <HairstyleCard
                  key={style.id}
                  style={style}
                  onSelect={() => handleSelectStyle(style.prompt, style.id)}
                  isBusy={isLoading || !!selectedHairstyleId}
                  isSelected={selectedHairstyleId === style.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="w-full max-w-md p-6 text-center glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 font-serif text-2xl font-bold text-black dark:text-white">
              {t("vto_share_modal_title")}
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => handlePlatformShare("facebook")}
                disabled={isUploadingForShare}
                className="w-full flex items-center justify-center gap-3 text-lg font-semibold py-3 px-4 rounded-full transition-colors bg-[#1877F2] text-white hover:bg-[#166e_d_a] disabled:opacity-60 disabled:cursor-wait"
              >
                {isUploadingForShare ? (
                  <div className="w-6 h-6 border-2 rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  <FacebookIcon className="w-6 h-6" />
                )}
                {t("vto_share_on_facebook")}
              </button>
              <button
                onClick={() => handlePlatformShare("twitter")}
                disabled={isUploadingForShare}
                className="flex items-center justify-center w-full gap-3 px-4 py-3 text-lg font-semibold text-white transition-colors bg-black rounded-full hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-60 disabled:cursor-wait"
              >
                {isUploadingForShare ? (
                  <div className="w-6 h-6 border-2 rounded-full border-t-transparent animate-spin"></div>
                ) : (
                  <XIcon className="w-6 h-6" />
                )}
                {t("vto_share_on_twitter")}
              </button>
              <div className="glass-panel !bg-black/5 dark:!bg-white/5 p-4 rounded-lg">
                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-3 text-lg font-semibold py-3 px-4 rounded-full transition-colors bg-[#E1306C] text-white hover:bg-[#c42a5d]"
                >
                  <InstagramIcon className="w-6 h-6" />{" "}
                  {t("vto_share_for_instagram")}
                </button>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {t("vto_share_for_instagram_desc")}
                </p>
              </div>

              <button
                onClick={handleGenericShare}
                className="flex items-center justify-center w-full gap-3 px-4 py-3 text-lg font-semibold text-white transition-colors bg-gray-600 rounded-full hover:bg-gray-700"
              >
                <ShareIcon className="w-6 h-6" /> {t("vto_share_image_file")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VirtualTryOn;
