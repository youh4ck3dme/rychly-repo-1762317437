

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConsultationStyle, HairstylePreference } from '../../types';
import { useTranslation } from '../../lib/i18n.tsx';
import { MobilePairingModal } from '../ui/MobilePairingModal';
import { CameraIcon } from '../ui/CameraIcon';
import { savePhoto, getPhotoHistory } from '../../lib/storage';
import { PhotoGallery } from '../ui/PhotoGallery';

interface ImageUploadScreenProps {
  onImageReady: (imageDataUrl: string) => void;
  error: string | null;
  selectedStyle: ConsultationStyle;
  onStyleChange: (style: ConsultationStyle) => void;
  selectedHairstyle: HairstylePreference;
  onHairstyleChange: (style: HairstylePreference) => void;
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as a valid data URL.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const GoldParticleBackground = React.memo(() => {
    // PERFORMANCE: Memoize particles to prevent re-calculation on every render.
    const particles = React.useMemo(() => {
        return Array.from({ length: 50 }).map((_, i) => {
            const size = Math.random() * 2 + 1; // 1px to 3px
            const style: React.CSSProperties = {
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                bottom: `-${size}px`, // Start from below the screen
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${Math.random() * 15 + 10}s`, // 10s to 25s duration
                boxShadow: `0 0 ${Math.random() * 5 + 3}px rgba(255, 215, 0, 0.7)`,
            };
            return <div key={i} className="particle" style={style} />;
        });
    }, []);

    return <div className="particle-container">{particles}</div>;
});


// --- Custom "Alchemist" Icons ---

const ClassicIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="url(#gold)"/>
        <circle cx="12" cy="12" r="3" stroke="url(#gold)"/>
    </svg>
);
const TrendyIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M12 3v2.35c0 .39.23.74.58.9l4.21 2.53c.34.2.58.55.58.94v2.46c0 .39-.23.74-.58.9l-4.21 2.53c-.34.2-.58.55-.58.94V19" stroke="url(#gold)"/>
        <path d="M3.5 6.88L8.7 9.4c.34.2.58.55.58.94v2.46c0 .39-.23.74-.58.9L3.5 16.12" stroke="url(#gold)"/>
    </svg>
);
const BoldIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="url(#gold)" fill="url(#gold)" fillOpacity="0.3"/>
    </svg>
);
const LowMaintIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M20 12c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8" stroke="url(#gold)"/>
        <path d="M20 12h-4c0-2.2-1.8-4-4-4S8 9.8 8 12" stroke="url(#gold)"/>
    </svg>
);
const GlamorousIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" stroke="url(#gold)" fill="url(#gold)" fillOpacity="0.3"/>
    </svg>
);
const BohemianIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M12 5C4 5 4 11 12 11s8-6 8-6" stroke="url(#gold)"/>
        <path d="M12 11c-2.5 0-5 2.5-5 2.5S7 18 12 18s7.5-4.5 7.5-4.5S14.5 11 12 11z" stroke="url(#gold)"/>
        <path d="M12 18v3" stroke="url(#gold)"/>
    </svg>
);
const ArtDecoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="url(#gold)"/>
        <path d="M2 7l10 5 10-5" stroke="url(#gold)"/>
        <path d="M12 22V12" stroke="url(#gold)"/>
    </svg>
);
const FuturisticIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M21 12a9 9 0 1 1-9-9" stroke="url(#gold)"/>
        <path d="M15.7 15.7L12 12l-3.7 3.7" stroke="url(#gold)"/>
        <path d="M12 6V2" stroke="url(#gold)"/>
        <path d="M12 22v-4" stroke="url(#gold)"/>
    </svg>
);

// --- NEW Exclusive Hairstyle Icons ---
const KeepIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M21 12a9 9 0 1 1-6.2-8.7" stroke="url(#gold)"/>
        <path d="M21 3v5h-5" stroke="url(#gold)"/>
    </svg>
);
const BobIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M5 9.5C5 7 7 5 12 5s7 2 7 4.5" stroke="url(#gold)"/>
        <path d="M5.5 9.5A8.5 8.5 0 0 0 12 19a8.5 8.5 0 0 0 6.5-9.5" stroke="url(#gold)"/>
    </svg>
);
const LongLayersIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M6 7q6 2 12 0" stroke="url(#gold)"/>
        <path d="M6 12q6 2 12 0" stroke="url(#gold)"/>
        <path d="M6 17q6 2 12 0" stroke="url(#gold)"/>
    </svg>
);
const PixieIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M12 6 L15 3 M9 10 L12 7 M6 14 L9 11 M15 10 L18 7 M12 14 L15 11" stroke="url(#gold)"/>
        <path d="M8 20 C10 16, 14 16, 16 20" stroke="url(#gold)"/>
    </svg>
);
const WavyLobIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M6 8c4 2, 8-2, 12 0s-8 10-12 8" stroke="url(#gold)"/>
    </svg>
);
const ShaggyBobIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M6 9.5C6 7 8 5 12 5s6 2 6 4.5 M7 9L5 11 M17 9l2 2 M9 6L8 4 M15 6l1-2" stroke="url(#gold)"/>
        <path d="M6.5 9.5A7.5 7.5 0 0 0 12 18a7.5 7.5 0 0 0 5.5-8.5" stroke="url(#gold)"/>
    </svg>
);
const ButterflyCutIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M12 4C8 4 6 8 6 10c0 2 2 6 6 6s6-4 6-6c0-2-2-6-6-6z" stroke="url(#gold)"/>
        <path d="M6 10c-2 1-4 4-4 7" stroke="url(#gold)"/>
        <path d="M18 10c2 1 4 4 4 7" stroke="url(#gold)"/>
    </svg>
);
const WolfCutIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M12 6L9 3 M15 6L18 3 M12 12 V 6" stroke="url(#gold)"/>
        <path d="M6 18 V 10 C 6 8, 8 6, 12 6 S 18 8, 18 10 V 18" stroke="url(#gold)"/>
    </svg>
);
const ItalianBobIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M5 9C5 6 7 4 12 4s7 2 7 5c0 4-2 7-7 7s-7-3-7-7z" stroke="url(#gold)"/>
    </svg>
);
const BixieCutIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M8 8L6 5 M16 8L18 5 M12 10V6" stroke="url(#gold)"/>
        <path d="M6 16v-4c0-2 2-4 6-4s6 2 6 4v4" stroke="url(#gold)"/>
    </svg>
);
const OctopusCutIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M12 11a5 5 0 0 1 5-5c1.5 0 3 .5 3 2.5" stroke="url(#gold)"/>
        <path d="M12 11a5 5 0 0 0-5-5c-1.5 0-3 .5-3 2.5" stroke="url(#gold)"/>
        <path d="M12 11v10 M9 14s-1 4-3 5 M15 14s1 4 3 5 M10 18s-1 2-2 2.5 M14 18s1 2 2 2.5" stroke="url(#gold)"/>
    </svg>
);
const CurveCutIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M8 4 A12 12 0 0 0 8 20" stroke="url(#gold)"/>
        <path d="M12 4 A12 12 0 0 0 12 20" stroke="url(#gold)"/>
        <path d="M16 4 A12 12 0 0 0 16 20" stroke="url(#gold)"/>
    </svg>
);
const ModernMulletIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="url(#gold)"/>
        <path d="M10 18 L12 10 L14 18" stroke="url(#gold)"/>
        <path d="M12 10v10" stroke="url(#gold)"/>
    </svg>
);
const BirkinBangsIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M5 10 A10 10 0 0 1 19 10" stroke="url(#gold)"/>
        <path d="M5 10 L4 18 M19 10 L20 18 M12 10 V 20" stroke="url(#gold)"/>
    </svg>
);
const HushCutIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M6 20s1-8 6-8 6 8 6 8" stroke="url(#gold)"/>
        <path d="M8 16s1-5 4-5 4 5 4 5" stroke="url(#gold)"/>
        <path d="M10 12s1-3 2-3 2 3 2 3" stroke="url(#gold)"/>
    </svg>
);

// FIX: Replaced `JSX.Element` with `React.ReactElement` to resolve TypeScript error.
const consultationStyles: { id: ConsultationStyle; icon: React.ReactElement }[] = [
    { id: 'classic', icon: <ClassicIcon /> }, { id: 'trendy', icon: <TrendyIcon /> },
    { id: 'bold', icon: <BoldIcon /> }, { id: 'lowMaintenance', icon: <LowMaintIcon /> },
    { id: 'glamorous', icon: <GlamorousIcon /> }, { id: 'bohemian', icon: <BohemianIcon /> },
    { id: 'artDeco', icon: <ArtDecoIcon /> }, { id: 'futuristic', icon: <FuturisticIcon /> },
];

// FIX: Replaced `JSX.Element` with `React.ReactElement` to resolve TypeScript error.
const hairstylePreferences: { id: HairstylePreference; icon: React.ReactElement }[] = [
    { id: 'keep', icon: <KeepIcon /> }, { id: 'bob', icon: <BobIcon /> },
    { id: 'longLayers', icon: <LongLayersIcon /> }, { id: 'pixie', icon: <PixieIcon /> },
    { id: 'wavyLob', icon: <WavyLobIcon /> }, { id: 'shaggyBob', icon: <ShaggyBobIcon /> },
    { id: 'butterflyCut', icon: <ButterflyCutIcon /> }, { id: 'wolfCut', icon: <WolfCutIcon /> },
    { id: 'italianBob', icon: <ItalianBobIcon /> }, { id: 'bixieCut', icon: <BixieCutIcon /> },
    { id: 'octopusCut', icon: <OctopusCutIcon /> }, { id: 'curveCut', icon: <CurveCutIcon /> },
    { id: 'modernMullet', icon: <ModernMulletIcon /> }, { id: 'birkinBangs', icon: <BirkinBangsIcon /> },
    { id: 'hushCut', icon: <HushCutIcon /> },
];

const wizardSteps = [
    { title: 'upload.consultationStyleTitle', subtitle: 'upload.consultationStyleSubtitle' },
    { title: 'upload.hairstylePreferenceTitle', subtitle: 'upload.hairstylePreferenceSubtitle' },
    { title: 'upload.finalStepTitle', subtitle: 'upload.finalStepSubtitle' },
];

interface OptionCardProps {
  label: string; description: string; icon: React.ReactNode;
  selected: boolean; onClick: () => void;
}

const OptionCard = React.memo(({ label, description, icon, selected, onClick }: OptionCardProps) => (
    <motion.div
        onClick={onClick}
        className={`bg-gray-900 p-3 rounded-lg text-center cursor-pointer border-2 transition-colors flex flex-col items-center ${selected ? 'border-yellow-300' : 'border-gray-800 hover:border-gray-700'}`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
        <div className="w-8 h-8 flex items-center justify-center">{icon}</div>
        <p className="font-bold text-sm mt-2 text-white">{label}</p>
        <p className="text-xs text-gray-400 mt-1 flex-grow">{description}</p>
    </motion.div>
));

const ErrorMessage = ({ message }: { message: string | null }) => {
  if (!message) return null;
  return (
    <div className="bg-red-900/30 border border-red-500/30 text-red-300 text-sm rounded-lg p-3 mt-2 flex items-center gap-2 w-full text-left">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{message}</span>
    </div>
  );
};

export const ImageUploadScreen = React.memo(({ onImageReady, error, selectedStyle, onStyleChange, selectedHairstyle, onHairstyleChange }: ImageUploadScreenProps) => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [photoHistory, setPhotoHistory] = useState<string[]>([]);

    const isCapturing = mediaStream !== null;

    useEffect(() => {
        setPhotoHistory(getPhotoHistory());
    }, []);

    const handleImageSubmission = useCallback((dataUrl: string) => {
        savePhoto(dataUrl);
        setPhotoHistory(getPhotoHistory()); // Refresh history immediately
        onImageReady(dataUrl);
    }, [onImageReady]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const dataUrl = await fileToDataUrl(file);
                handleImageSubmission(dataUrl);
            } catch (err) {
                console.error("Error reading file:", err);
            }
        }
    };

    const stopCamera = useCallback(() => {
        setMediaStream(null);
    }, []);
    
    // Effect for stream cleanup. This runs when mediaStream changes or component unmounts.
    useEffect(() => {
        if (mediaStream) {
            return () => {
                mediaStream.getTracks().forEach(track => track.stop());
            };
        }
    }, [mediaStream]);

    const handleCameraStart = useCallback(async () => {
        if (mediaStream) return;
        if (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices?.enumerateDevices) {
            setCameraError(t('upload.cameraError.notSupported'));
            setIsPairingModalOpen(true);
            return;
        }
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasVideoInput = devices.some(d => d.kind === 'videoinput');
            if (!hasVideoInput) {
                setCameraError(t('upload.cameraError.notFound'));
                setIsPairingModalOpen(true);
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } });
            setMediaStream(stream);
            setCameraError(null);
        } catch (err) {
            let translated = t('upload.cameraError.generic');
            if (err instanceof DOMException) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') translated = t('upload.cameraError.denied');
                else if (err.name === 'NotFoundError') translated = t('upload.cameraError.notFound');
            }
            setCameraError(translated);
            setIsPairingModalOpen(true);
            console.error('[camera] error starting stream:', err);
        }
    }, [t, mediaStream]);
    
    // Effect to attach the media stream to the video element.
    useEffect(() => {
        const videoElement = videoRef.current;
        if (isCapturing && mediaStream && videoElement) {
            if (videoElement.srcObject !== mediaStream) {
                videoElement.srcObject = mediaStream;
                videoElement.play().catch(e => {
                    console.error("Video play error:", e);
                    setCameraError(t('upload.cameraError.generic'));
                });
            }
        } else if (videoElement) {
            videoElement.srcObject = null;
        }
    }, [isCapturing, mediaStream, t]);

    const handleCapture = useCallback(() => {
        const video = videoRef.current;
        if (video && video.readyState >= 2) { // Check if video has enough data to capture
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Flip the canvas context horizontally to mirror the selfie view
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            }
            const dataUrl = canvas.toDataURL('image/png');
            stopCamera(); // Stop camera after successful capture
            handleImageSubmission(dataUrl);
        } else {
            setCameraError(t('upload.cameraError.notReady'));
        }
    }, [handleImageSubmission, stopCamera, t]);
    
    const currentStepInfo = wizardSteps[step - 1];

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
                        {consultationStyles.map(style => (
                            <OptionCard key={style.id} label={t(`upload.styles.${style.id}`)} description={t(`upload.styles.${style.id}.desc`)} icon={style.icon} selected={selectedStyle === style.id} onClick={() => onStyleChange(style.id)} />
                        ))}
                    </div>
                );
            case 2:
                return (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {hairstylePreferences.map(style => (
                            <OptionCard key={style.id} label={t(`upload.hairstyles.${style.id}`)} description={t(`upload.hairstyles.${style.id}.desc`)} icon={style.icon} selected={selectedHairstyle === style.id} onClick={() => onHairstyleChange(style.id)} />
                        ))}
                    </div>
                );
            case 3:
                return (
                     <div className="flex flex-col items-center gap-4 w-full">
                        {/* Main container for video feed */}
                        <div className="w-full max-w-lg aspect-video sm:aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden relative border border-yellow-300/20 mb-2">
                            <AnimatePresence mode="wait">
                                {isCapturing ? (
                                    <motion.div 
                                        key="camera-view"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full h-full"
                                    >
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]"></video>
                                        <button 
                                            onClick={stopCamera} 
                                            className="absolute top-3 right-3 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                                            aria-label="Close camera"
                                        >
                                            <X size={20} />
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="placeholder-particles"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="w-full h-full relative bg-black"
                                    >
                                        <GoldParticleBackground />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Controls */}
                        <div className="w-full flex flex-col items-center gap-4 max-w-sm">
                            <AnimatePresence mode="wait">
                                {isCapturing ? (
                                    <motion.div
                                        key="capture-controls"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="flex flex-col items-center justify-center min-h-[150px]"
                                    >
                                        <button 
                                            onClick={handleCapture} 
                                            className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-black/30 transform transition hover:scale-105"
                                            aria-label="Capture photo"
                                        >
                                            <CameraIcon className="text-black w-8 h-8"/>
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="upload-controls"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="w-full flex flex-col items-center gap-4"
                                    >
                                        <button onClick={handleCameraStart} className="w-full bg-gray-800 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors">
                                            <Camera size={20} /> {t('upload.useCamera')}
                                        </button>
                                        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gray-800 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors">
                                            <Upload size={20} /> {t('upload.uploadPhoto')}
                                        </button>
                                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                        <ErrorMessage message={cameraError} />
                                        <ErrorMessage message={error} />
                                        <PhotoGallery photos={photoHistory} onSelectPhoto={handleImageSubmission} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                );
            default: return null;
        }
    };
    
    return (
        <div className="flex-grow flex flex-col bg-black text-white p-4">
            <header className="text-center mb-6">
                <h1 className="text-2xl font-bold tracking-wider">{t('upload.title')}</h1>
                <p className="text-sm text-gray-400 mt-1">{t('upload.subtitle')}</p>
            </header>
            
            <div className="w-full max-w-sm mx-auto mb-6">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                    <span>{t(wizardSteps[0].title)}</span>
                    <span>{t(wizardSteps[1].title)}</span>
                    <span>{t(wizardSteps[2].title)}</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full relative">
                    <motion.div className="h-1 bg-yellow-300 rounded-full" animate={{ width: `${(step / 3) * 100}%` }} transition={{ type: 'spring' }} />
                </div>
            </div>

            <main className="flex-grow flex flex-col items-center justify-center">
                 <div className="text-center mb-6">
                    <h2 className="text-lg font-bold">{t(currentStepInfo.title)}</h2>
                    <p className="text-xs text-gray-400">{t(currentStepInfo.subtitle)}</p>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-4xl"
                    >
                       {renderStepContent()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {step < 3 && (
                <footer className="mt-auto pt-6 flex justify-center gap-4 max-w-sm mx-auto w-full">
                    {step > 1 && <button onClick={() => setStep(s => s - 1)} className="bg-gray-800 font-bold py-3 px-8 rounded-lg">{t('upload.prevStep')}</button>}
                    <button onClick={() => setStep(s => s + 1)} className="bg-white text-black font-bold py-3 px-8 rounded-lg flex-grow">{t('upload.nextStep')}</button>
                </footer>
            )}
             <MobilePairingModal isOpen={isPairingModalOpen} onClose={() => setIsPairingModalOpen(false)} />
        </div>
    );
});