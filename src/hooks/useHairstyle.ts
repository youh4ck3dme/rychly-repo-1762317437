import { useState, useEffect, useCallback, useRef } from "react";
import { editImageWithPrompt } from "../../services/geminiService";

export const useHairstyle = () => {
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
        "Loading...",
        "Processing image...",
        "Applying hairstyle...",
        "Almost done...",
        "Finalizing...",
        "Complete!",
      ];
      let index = 0;
      setLoadingMessage(messages[index]);
      timer = setInterval(() => {
        index = (index + 1) % messages.length;
        setLoadingMessage(messages[index]);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

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

      setSelectedHairstyleId(styleId);
      setIsLoading(true);

      if (styleId !== "refine") {
        setGeneratedImage(null);
      }

      const base64Data = userImage.split(",")[1];
      const result = await editImageWithPrompt(
        base64Data,
        prompt,
        "image/jpeg",
      );

      setIsLoading(false);
      setSelectedHairstyleId(null);

      if (result.data) {
        setGeneratedImage(`data:image/jpeg;base64,${result.data}`);
      } else if (result.error) {
        console.error("Error:", result.error);
      }
    },
    [],
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
