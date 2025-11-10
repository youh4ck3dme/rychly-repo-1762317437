import { useState, useEffect, useCallback, useRef } from "react";
import { useNotification } from "./useNotification";
import { useTranslation } from "./useTranslation";
import { editImageWithSofia } from "../services/geminiService";
import { useAuth } from "../context/AuthContext"; // Import useAuth

export const useHairstyle = () => {
  const { addNotification } = useNotification();
  const { t } = useTranslation();
  const { isDevMode, devCredits, decrementDevCredit } = useAuth(); // Use auth context

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [selectedHairstyleId, setSelectedHairstyleId] = useState<string | null>(
    null,
  );
  const [progress, setProgress] = useState(0);
  const wasLoading = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isLoading) {
      const messages = [
        t("vto_loading1"),
        t("vto_loading2"),
        t("vto_loading3"),
        t("vto_loading4"),
        t("vto_loading5"),
        t("vto_loading6"),
      ];
      let index = 0;
      setLoadingMessage(messages[index]);
      timer = setInterval(() => {
        index = (index + 1) % messages.length;
        setLoadingMessage(messages[index]);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isLoading, t]);

  useEffect(() => {
    let finalProgressTimer: ReturnType<typeof setTimeout>;
    if (isLoading) {
      wasLoading.current = true;
      setProgress(0);
      const startTimer = setTimeout(() => {
        setProgress(95);
      }, 100);
      return () => clearTimeout(startTimer);
    } else {
      if (wasLoading.current) {
        wasLoading.current = false;
        setProgress(100);
        finalProgressTimer = setTimeout(() => setProgress(0), 500);
      }
    }
    return () => clearTimeout(finalProgressTimer);
  }, [isLoading]);

  const applyHairstyle = useCallback(
    async (userImage: string, prompt: string, styleId: string) => {
      if (!userImage) {
        console.error("applyHairstyle called without a user image.");
        return;
      }

      // FIX: Always clear the generated image at the very beginning of a new generation process
      // This prevents a stale image from briefly appearing while the new one is loading.
      setGeneratedImage(null);

      // Check dev mode credits
      if (isDevMode) {
        if (devCredits === null || devCredits <= 0) {
          addNotification({
            type: "error",
            title: t("vto_dev_no_credits_title"),
            message: t("vto_dev_no_credits_message"),
          });
          return;
        }
        // Decrement credit before making the API call
        decrementDevCredit();
      }

      setSelectedHairstyleId(styleId);
      setIsLoading(true);

      const base64Data = userImage.split(",")[1];
      const result = await editImageWithSofia(base64Data, prompt, "image/jpeg");

      setIsLoading(false);
      setSelectedHairstyleId(null);

      if (result.data) {
        setGeneratedImage(`data:image/jpeg;base64,${result.data}`);
      } else if (result.error) {
        addNotification({
          type: "error",
          title: t("vto_error_title"),
          message: t(result.error),
        });
      }
    },
    [addNotification, t, isDevMode, devCredits, decrementDevCredit],
  );

  const resetHairstyle = useCallback(() => {
    setGeneratedImage(null);
    setIsLoading(false);
    setSelectedHairstyleId(null);
    setLoadingMessage("");
  }, []);

  return {
    generatedImage,
    isLoading,
    loadingMessage,
    selectedHairstyleId,
    applyHairstyle,
    resetHairstyle,
    progress,
  };
};
