


import React, { useEffect, useState } from 'react';
import type { HairAnalysisResult, ConsultationStyle, HairstylePreference } from '../../types';
import { analyzeHairImage } from '../../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../lib/i18n.tsx';

interface AnalysisScreenProps {
  userImage: string;
  onAnalysisComplete: (result: HairAnalysisResult) => void;
  onAnalysisError: (error: string) => void;
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
export const AnalysisScreen = React.memo(({ userImage, onAnalysisComplete, onAnalysisError, consultationStyle, hairstylePreference }: AnalysisScreenProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const { t } = useTranslation();

    useEffect(() => {
        const performAnalysis = async () => {
            try {
                const result = await analyzeHairImage(userImage, consultationStyle, hairstylePreference);
                onAnalysisComplete(result);
            } catch (error) {
                // Log more detailed error information for debugging
                console.error("Detailed error during hair analysis:", error);

                // Provide more specific feedback to the user
                let userMessage = "We couldn't analyze your photo. Please try another one with better lighting."; // Default message

                if (error instanceof Error && error.message) {
                    const message = error.message.toLowerCase();
                    if (message.includes('safety') || message.includes('blocked')) {
                        userMessage = "The uploaded image couldn't be processed due to safety policies. Please try a different photo.";
                    } else if (message.includes('503') || message.includes('unavailable')) {
                        userMessage = "The analysis service is temporarily unavailable. Please try again in a few moments.";
                    } else if (message.includes('invalid response structure') || error instanceof SyntaxError) {
                        userMessage = "The AI analysis returned an unexpected result. A different photo with clearer lighting might work better.";
                    } else if (message.includes('api key')) {
                         userMessage = "There is a configuration issue with the service. Please contact support.";
                    }
                }
                
                onAnalysisError(userMessage);
            }
        };

        performAnalysis();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userImage, onAnalysisComplete, onAnalysisError, consultationStyle, hairstylePreference]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev + 1) % analysisStepKeys.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-black text-white">
            <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg"
            >
                <img src={userImage} alt="User for analysis" className="w-full h-full object-cover" />
            </motion.div>
            
            <h1 className="text-3xl font-bold mt-8 tracking-wide">{t('analysis.title')}</h1>
            
            <div className="h-6 mt-4 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={currentStep}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="text-gray-300"
                    >
                        {t(analysisStepKeys[currentStep])}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
});