import React, { useEffect, useState, useCallback } from "react";
import type {
  HairAnalysisResult,
  ConsultationStyle,
  HairstylePreference,
} from "../../types";
import { analyzeHairImage } from "../../services/geminiService";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../../lib/i18n.tsx";

interface AnalysisScreenProps {
  userImage: string;
  onAnalysisComplete: (result: HairAnalysisResult) => void;
  onAnalysisError: (
    error: string,
    options?: { retryable?: boolean; showRetryButton?: boolean },
  ) => void;
  consultationStyle: ConsultationStyle;
  hairstylePreference: HairstylePreference;
}

const analysisStepKeys = [
  "analysis.steps.1",
  "analysis.steps.2",
  "analysis.steps.3",
  "analysis.steps.4",
  "analysis.steps.5",
  "analysis.steps.6",
  "analysis.steps.7",
  "analysis.steps.8",
];

// FIX: Removed React.FC and explicitly typed props to improve type compatibility.
// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler, resolving issues with `framer-motion` prop type inference.
export const AnalysisScreen = React.memo(
  ({
    userImage,
    onAnalysisComplete,
    onAnalysisError,
    consultationStyle,
    hairstylePreference,
  }: AnalysisScreenProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);
    const [errorOptions, setErrorOptions] = useState<{
      retryable?: boolean;
      showRetryButton?: boolean;
    } | null>(null);
    const { t } = useTranslation();

    const performAnalysis = useCallback(async () => {
      try {
        setIsRetrying(false);
        const result = await analyzeHairImage(
          userImage,
          consultationStyle,
          hairstylePreference,
        );
        onAnalysisComplete(result);
        setErrorOptions(null); // Clear any previous error state
      } catch (error) {
        // Log more detailed error information for debugging
        console.error("Detailed error during hair analysis:", error);

        // Enhanced error categorization and user-friendly messages
        let userMessage =
          "We couldn't analyze your photo. Please try another one with better lighting.";
        let retryable = true;
        let showRetryButton = false;

        if (error instanceof Error && error.message) {
          const message = error.message.toLowerCase();

          if (
            message.includes("safety") ||
            message.includes("blocked") ||
            message.includes("content policy")
          ) {
            userMessage =
              "The uploaded image couldn't be processed due to content policies. Please try a different photo with clear hair visibility.";
            retryable = false;
          } else if (message.includes("timeout") || message.includes("408")) {
            userMessage =
              "The analysis is taking longer than expected. Please try again.";
            showRetryButton = true;
          } else if (
            message.includes("rate limit") ||
            message.includes("429") ||
            message.includes("too many requests")
          ) {
            userMessage =
              "The service is currently busy. Please wait a moment and try again.";
            showRetryButton = true;
          } else if (
            message.includes("network") ||
            message.includes("connection") ||
            message.includes("503")
          ) {
            userMessage =
              "Network connection issue. Please check your internet and try again.";
            showRetryButton = true;
          } else if (
            message.includes("quota") ||
            message.includes("insufficient") ||
            message.includes("billing")
          ) {
            userMessage =
              "The analysis service is temporarily unavailable. Please try again later.";
            retryable = false;
          } else if (
            message.includes("invalid image") ||
            message.includes("format") ||
            message.includes("corrupted")
          ) {
            userMessage =
              "The image format is not supported. Please upload a clear photo in JPG, PNG, or WebP format.";
            retryable = false;
          } else if (
            message.includes("parse") ||
            message.includes("json") ||
            message.includes("unexpected result")
          ) {
            userMessage =
              "The AI analysis encountered an issue. A different photo with better lighting might work better.";
            retryable = true;
          } else if (
            message.includes("api key") ||
            message.includes("authentication")
          ) {
            userMessage =
              "There is a temporary service issue. Please contact support if this persists.";
            retryable = false;
          } else if (
            message.includes("size") ||
            message.includes("too large")
          ) {
            userMessage =
              "The image is too large. Please upload a smaller photo (max 10MB).";
            retryable = false;
          }
        }

        const options = { retryable, showRetryButton };
        setErrorOptions(options);
        onAnalysisError(userMessage, options);
      }
    }, [
      userImage,
      consultationStyle,
      hairstylePreference,
      onAnalysisComplete,
      onAnalysisError,
    ]);

    useEffect(() => {
      performAnalysis();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userImage, consultationStyle, hairstylePreference]);

    const handleRetry = useCallback(() => {
      setIsRetrying(true);
      performAnalysis();
    }, [performAnalysis]);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % analysisStepKeys.length);
      }, 2000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="flex flex-col items-center justify-center flex-grow p-8 text-center text-white bg-black">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-48 h-48 overflow-hidden border-4 border-white rounded-full shadow-lg"
        >
          <img
            src={userImage}
            alt="User for analysis"
            className="object-cover w-full h-full"
          />
        </motion.div>

        <h1 className="mt-8 text-3xl font-bold tracking-wide">
          {t("analysis.title")}
        </h1>

        <div className="h-6 mt-4 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-gray-300"
            >
              {t(analysisStepKeys[currentStep])}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Retry button for retryable errors */}
        {errorOptions?.showRetryButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-3 mt-6 font-bold text-black transition-colors bg-yellow-500 rounded-lg hover:bg-yellow-400 disabled:opacity-50"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying
              ? t("analysis.retrying") || "Retrying..."
              : t("analysis.retry") || "Try Again"}
          </motion.button>
        )}
      </div>
    );
  },
);
