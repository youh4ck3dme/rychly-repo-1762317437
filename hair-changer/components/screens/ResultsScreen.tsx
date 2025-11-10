import React, { useState, useCallback } from "react";
import type { HairAnalysisResult, HairSuggestion, Tab } from "../../types";
import { motion, AnimatePresence } from "framer-motion";
import { applyVirtualTryOn } from "../../services/geminiService";
import {
  Loader2,
  RefreshCw,
  Palette,
  ShieldCheck,
  Waves,
  Share2,
} from "lucide-react";
import { useTranslation } from "../../lib/i18n.tsx";

interface ResultsScreenProps {
  userImage: string;
  result: HairAnalysisResult;
  onRestart: () => void;
  setActiveServices: (services: string[]) => void;
  onTabChange: (tab: Tab) => void;
}

const VIRTUAL_TRY_ON_CACHE_KEY = "virtualTryOnCache";
const MAX_CACHE_ENTRIES = 5; // Limit cache to 5 images to prevent storage quota errors.

interface ImageCache {
  order: string[];
  items: Record<string, string>;
}

// FIX: Moved `SuggestionButton` outside `ResultsScreen` to stabilize its type and prevent re-creation on each render. This resolves errors with `key` and `children` props during type checking.
const SuggestionButton = React.memo(
  ({
    suggestion,
    onClick,
    isActive,
    children,
  }: {
    suggestion?: HairSuggestion;
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
  }) => (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-full cursor-pointer transition-all flex items-center justify-center relative"
        style={
          suggestion
            ? { backgroundColor: suggestion.hex }
            : { backgroundColor: "transparent" }
        }
        aria-label={suggestion ? `Try on ${suggestion.name}` : "Button"}
      >
        {children}
      </button>
      {isActive && (
        <motion.div
          layoutId="active-suggestion-border"
          className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.div>
  ),
);

// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler, resolving issues with `framer-motion` prop type inference.
export const ResultsScreen = React.memo(
  ({
    userImage,
    result,
    onRestart,
    setActiveServices,
    onTabChange,
  }: ResultsScreenProps) => {
    const [selectedSuggestion, setSelectedSuggestion] =
      useState<HairSuggestion>(result.suggestions[0]);
    const [displayImage, setDisplayImage] = useState<string>(userImage);

    const [editedImagesCache, setEditedImagesCache] = useState<ImageCache>(
      () => {
        try {
          const cachedData = sessionStorage.getItem(VIRTUAL_TRY_ON_CACHE_KEY);
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            // Basic validation for the cache structure
            if (
              parsed &&
              Array.isArray(parsed.order) &&
              typeof parsed.items === "object"
            ) {
              return parsed;
            }
          }
        } catch (error) {
          console.error(
            "Failed to read virtual try-on cache from sessionStorage:",
            error,
          );
          // Clear potentially corrupt data
          sessionStorage.removeItem(VIRTUAL_TRY_ON_CACHE_KEY);
        }
        return { order: [], items: {} };
      },
    );

    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isSharing, setIsSharing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false);
    const [customColorHex, setCustomColorHex] = useState<string>("#8A2BE2"); // Default: BlueViolet
    const [activeDisplayType, setActiveDisplayType] = useState<
      "suggestion" | "original"
    >("suggestion");
    const [customColorSuggestion, setCustomColorSuggestion] =
      useState<HairSuggestion | null>(null);
    const { t } = useTranslation();

    const updateImageCache = useCallback((key: string, value: string) => {
      setEditedImagesCache((prevCache) => {
        const newItems = { ...prevCache.items, [key]: value };
        const newOrder = prevCache.order.filter((k) => k !== key);
        newOrder.push(key);

        // Evict oldest entries if cache exceeds max size (FIFO)
        while (newOrder.length > MAX_CACHE_ENTRIES) {
          const oldestKey = newOrder.shift();
          if (oldestKey) {
            delete newItems[oldestKey];
          }
        }

        const newCache: ImageCache = { order: newOrder, items: newItems };

        try {
          sessionStorage.setItem(
            VIRTUAL_TRY_ON_CACHE_KEY,
            JSON.stringify(newCache),
          );
        } catch (e) {
          console.error(
            "Failed to write virtual try-on cache to sessionStorage:",
            e,
          );
          // Fallback: If quota is still exceeded, try storing just the current item.
          if (e instanceof DOMException && e.name === "QuotaExceededError") {
            console.warn(
              "Quota exceeded. Clearing cache and attempting to save only the current item.",
            );
            try {
              const singleItemCache: ImageCache = {
                order: [key],
                items: { [key]: value },
              };
              sessionStorage.setItem(
                VIRTUAL_TRY_ON_CACHE_KEY,
                JSON.stringify(singleItemCache),
              );
              return singleItemCache;
            } catch (innerError) {
              console.error(
                "Failed to write even a single item to session storage. Caching is disabled for this item.",
                innerError,
              );
              return prevCache; // Revert to previous state if even single item fails
            }
          }
        }
        return newCache;
      });
    }, []);

    const handleShare = useCallback(async () => {
      if (isSharing) return;
      setIsSharing(true);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsSharing(false);
        return;
      }

      const loadImg = (src: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

      try {
        const [beforeImg, afterImg] = await Promise.all([
          loadImg(userImage),
          loadImg(displayImage),
        ]);

        const imgWidth = 512;
        const imgHeight = 512;
        const padding = 20;
        const labelHeight = 40;
        const totalWidth = imgWidth * 2 + padding * 3;
        const totalHeight = imgHeight + padding * 2 + labelHeight;

        canvas.width = totalWidth;
        canvas.height = totalHeight;

        ctx.fillStyle = "#111827"; // bg-gray-900
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        ctx.drawImage(
          beforeImg,
          padding,
          padding + labelHeight,
          imgWidth,
          imgHeight,
        );
        ctx.drawImage(
          afterImg,
          imgWidth + padding * 2,
          padding + labelHeight,
          imgWidth,
          imgHeight,
        );

        ctx.fillStyle = "white";
        ctx.font = "bold 24px -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          "Before",
          padding + imgWidth / 2,
          padding + labelHeight - 10,
        );
        ctx.fillText(
          "After",
          imgWidth + padding * 2 + imgWidth / 2,
          padding + labelHeight - 10,
        );

        const link = document.createElement("a");
        link.download = "my-hair-id-papi-hair-design.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Failed to generate share image:", error);
      } finally {
        setIsSharing(false);
      }
    }, [userImage, displayImage, isSharing]);

    const handleSuggestionSelect = useCallback(
      async (suggestion: HairSuggestion) => {
        setActiveDisplayType("suggestion");
        setSelectedSuggestion(suggestion);
        setError(null);
        setActiveServices(suggestion.services);

        // Check cache first
        const cacheKey = `${suggestion.name}_${suggestion.hex}`;
        if (editedImagesCache.items[cacheKey]) {
          setDisplayImage(editedImagesCache.items[cacheKey]);
          return;
        }

        setIsGenerating(true);
        try {
          const newImage = await applyVirtualTryOn(userImage, suggestion);
          updateImageCache(cacheKey, newImage);
          setDisplayImage(newImage);
        } catch (e) {
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError(t("results.error"));
          }
          console.error("Virtual try-on failed:", e);
          // Revert to original image on error
          setDisplayImage(userImage);
        } finally {
          setIsGenerating(false);
        }
      },
      [userImage, editedImagesCache, setActiveServices, t, updateImageCache],
    );

    const handleApplyCustomColor = () => {
      setIsColorPickerOpen(false);
      // Sanitize hex input
      let cleanHex = customColorHex.startsWith("#")
        ? customColorHex
        : `#${customColorHex}`;
      cleanHex = cleanHex.slice(0, 7);

      const customSuggestion: HairSuggestion = {
        name: `Custom: ${cleanHex.toUpperCase()}`,
        hairstyle: "Current Style",
        hex: cleanHex,
        description:
          "A custom shade selected by you, applied to your current hairstyle.",
        services: ["N/A"],
      };
      setCustomColorSuggestion(customSuggestion);
      handleSuggestionSelect(customSuggestion);
    };

    return (
      <div className="flex flex-col flex-grow bg-black text-white">
        <main className="flex-grow flex flex-col lg:flex-row lg:items-stretch">
          {/* Left Column: Image */}
          <div className="relative w-full aspect-square bg-gray-900 lg:w-1/2 lg:aspect-auto">
            <AnimatePresence mode="wait">
              <motion.img
                key={displayImage}
                src={displayImage}
                alt="Your hair with virtual try-on"
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors disabled:opacity-50"
              aria-label="Share your look"
            >
              {isSharing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Share2 size={20} />
              )}
            </button>
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10"
                >
                  <Loader2 className="animate-spin" size={48} />
                  <p className="mt-4 text-sm font-semibold">
                    {t("results.creatingLook")}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {isColorPickerOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                onClick={() => setIsColorPickerOpen(false)}
              >
                <div
                  className="bg-gray-800 p-6 rounded-lg w-full max-w-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-bold text-lg text-center mb-4">
                    {t("results.customColorTitle")}
                  </h3>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <label htmlFor="colorPicker" className="sr-only">
                      {t("results.customColorTitle")}
                    </label>
                    <input
                      id="colorPicker"
                      name="colorPicker"
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="w-16 h-16 p-0 border-none rounded-md cursor-pointer bg-transparent"
                    />
                    <div className="flex flex-col">
                      <label
                        htmlFor="hexInput"
                        className="text-xs text-gray-400 mb-1"
                      >
                        {t("results.hexCode")}
                      </label>
                      <input
                        id="hexInput"
                        name="hexInput"
                        type="text"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="bg-gray-700 rounded-md p-2 font-mono uppercase w-28 text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsColorPickerOpen(false)}
                      className="w-full bg-gray-600 font-bold py-3 px-4 rounded-md hover:bg-gray-500 transition-colors"
                    >
                      {t("results.cancel")}
                    </button>
                    <button
                      onClick={handleApplyCustomColor}
                      className="w-full bg-white text-black font-bold py-3 px-4 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      {t("results.apply")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Controls & Info */}
          <div className="p-4 flex-grow bg-gray-900 lg:w-1/2 lg:p-6 flex flex-col">
            <div className="lg:flex-grow lg:overflow-y-auto lg:pr-2">
              <h1 className="text-xl font-bold text-center tracking-wide">
                {t("results.title")}
              </h1>

              <div className="mt-4 p-4 bg-black rounded-lg">
                <h3 className="font-bold">{t("results.diagnosis")}</h3>
                <ul className="text-sm text-gray-300 mt-2 space-y-2">
                  <li className="flex items-center gap-2">
                    <Palette size={16} className="text-yellow-300" />
                    <span>
                      <strong>{t("results.currentColor")}:</strong>{" "}
                      {result.currentHair.color}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-yellow-300" />
                    <span>
                      <strong>{t("results.condition")}:</strong>{" "}
                      {result.currentHair.condition}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Waves size={16} className="text-yellow-300" />
                    <span>
                      <strong>{t("results.type")}:</strong>{" "}
                      {result.currentHair.type}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="font-bold text-center">{t("results.tryOn")}</h3>
                <div className="flex justify-center items-center flex-wrap gap-3 mt-3">
                  <SuggestionButton
                    onClick={() => {
                      setDisplayImage(userImage);
                      setError(null);
                      setActiveDisplayType("original");
                      setActiveServices([]);
                    }}
                    isActive={activeDisplayType === "original"}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-700 text-white flex items-center justify-center">
                      <RefreshCw size={20} />
                    </div>
                  </SuggestionButton>

                  <SuggestionButton
                    onClick={() => setIsColorPickerOpen(true)}
                    isActive={
                      activeDisplayType === "suggestion" &&
                      selectedSuggestion.name.startsWith("Custom:")
                    }
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white flex items-center justify-center">
                      <Palette size={20} />
                    </div>
                  </SuggestionButton>

                  {customColorSuggestion && (
                    <SuggestionButton
                      key={customColorSuggestion.name}
                      suggestion={customColorSuggestion}
                      onClick={() =>
                        handleSuggestionSelect(customColorSuggestion)
                      }
                      isActive={
                        activeDisplayType === "suggestion" &&
                        selectedSuggestion.name === customColorSuggestion.name
                      }
                    >
                      <div />
                    </SuggestionButton>
                  )}
                  {result.suggestions.map((suggestion) => (
                    <SuggestionButton
                      key={suggestion.name}
                      suggestion={suggestion}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      isActive={
                        activeDisplayType === "suggestion" &&
                        selectedSuggestion.name === suggestion.name
                      }
                    >
                      <div />
                    </SuggestionButton>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-4 bg-black rounded-lg">
                <h3 className="font-bold">
                  {activeDisplayType === "suggestion"
                    ? selectedSuggestion.name
                    : t("results.originalHair")}
                </h3>
                {activeDisplayType === "suggestion" && (
                  <p className="text-sm font-semibold text-gray-400 mt-1">
                    {t("results.hairstyle")}: {selectedSuggestion.hairstyle}
                  </p>
                )}
                <p className="text-sm text-gray-300 mt-1">
                  {activeDisplayType === "suggestion"
                    ? selectedSuggestion.description
                    : t("results.originalHairDescription")}
                </p>
                {activeDisplayType === "suggestion" &&
                  selectedSuggestion.services.length > 0 &&
                  selectedSuggestion.services[0] !== "N/A" && (
                    <>
                      <p className="text-xs text-gray-400 mt-2">
                        {t("results.recommendedServices")}:{" "}
                        {selectedSuggestion.services.join(", ")}
                      </p>
                      <button
                        onClick={() => onTabChange("services")}
                        className="w-full text-sm mt-3 bg-gray-800 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                      >
                        {t("results.viewServices")}
                      </button>
                    </>
                  )}
              </div>
              {error && (
                <p className="mt-2 text-center text-red-400 text-sm">{error}</p>
              )}
            </div>

            <div className="mt-auto pt-4 flex-shrink-0 space-y-3">
              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  ></path>
                </svg>
                Zdieľať na sociálnych sieťach
              </button>

              <button
                onClick={onRestart}
                className="w-full bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-300"
              >
                {t("results.startOver")}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  },
);
