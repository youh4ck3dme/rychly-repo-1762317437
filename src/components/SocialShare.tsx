import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../lib/i18n.tsx';

interface SocialShareProps {
  isVisible: boolean;
  onClose: () => void;
  originalImage?: string;
  resultImage?: string;
  hairstyle?: string;
  color?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  isVisible,
  onClose,
  originalImage,
  resultImage,
  hairstyle = 'Moderný účes',
  color = '#8B4513'
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');

  const filters = [
    {
      id: 'professional',
      name: 'Profesionálny',
      description: 'Čistý a elegantný vzhľad pre salón',
      icon: '💼'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Trendy filter pre sociálne média',
      icon: '📸'
    },
    {
      id: 'vintage',
      name: 'Vintage',
      description: 'Retro štýl s teplými tónmi',
      icon: '📺'
    },
    {
      id: 'dramatic',
      name: 'Dramatický',
      description: 'Výrazné tiene a kontrasty',
      icon: '🎭'
    },
    {
      id: 'natural',
      name: 'Prírodný',
      description: 'Jemný a prirodzený vzhľad',
      icon: '🌿'
    }
  ];

  const generateSocialImage = useCallback(async (filter: string) => {
    if (!originalImage || !resultImage || !canvasRef.current) return;

    setIsGenerating(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Set canvas size for social media (1:1 aspect ratio)
      canvas.width = 1080;
      canvas.height = 1080;

      // Load images
      const originalImg = await loadImage(originalImage);
      const resultImg = await loadImage(resultImage);

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply filter based on selection
      await applyFilter(ctx, originalImg, resultImg, filter);

      // Add PAPI branding
      addBranding(ctx);

      // Add social media text
      addSocialText(ctx, hairstyle, color);

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setGeneratedImage(dataUrl);

    } catch (error) {
      console.error('Error generating social image:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [originalImage, resultImage, hairstyle, color]);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const applyFilter = async (
    ctx: CanvasRenderingContext2D,
    originalImg: HTMLImageElement,
    resultImg: HTMLImageElement,
    filter: string
  ) => {
    const { width, height } = ctx.canvas;

    switch (filter) {
      case 'professional':
        // Clean, bright, professional look
        ctx.filter = 'brightness(1.1) contrast(1.1) saturate(1.1)';

        // Before image (top left)
        ctx.drawImage(originalImg, 50, 50, 400, 400);

        // After image (top right)
        ctx.drawImage(resultImg, width - 450, 50, 400, 400);

        // Comparison label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(50, 470, 400, 60);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PRED', width / 4, 510);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(width - 450, 470, 400, 60);
        ctx.fillStyle = '#FFD700';
        ctx.fillText('PO', (width * 3) / 4, 510);
        break;

      case 'instagram':
        // Trendy Instagram filter with warm tones
        ctx.filter = 'brightness(1.15) contrast(1.2) saturate(1.3) sepia(0.1)';

        // Full result image
        ctx.drawImage(resultImg, 0, 0, width, height);

        // Add trendy elements
        addInstagramElements(ctx);
        break;

      case 'vintage':
        // Vintage filter with warm, faded look
        ctx.filter = 'brightness(0.9) contrast(1.3) saturate(0.8) sepia(0.3)';

        // Side by side comparison
        ctx.drawImage(originalImg, 50, 100, 350, 350);
        ctx.drawImage(resultImg, width - 400, 100, 350, 350);

        // Vintage frame
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 8;
        ctx.strokeRect(30, 80, 390, 390);
        ctx.strokeRect(width - 420, 80, 390, 390);
        break;

      case 'dramatic':
        // Dramatic with high contrast and shadows
        ctx.filter = 'brightness(0.8) contrast(1.5) saturate(1.4)';

        // Center composition
        ctx.drawImage(resultImg, width / 2 - 300, height / 2 - 300, 600, 600);

        // Dramatic lighting effect
        const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 400);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;

      case 'natural':
        // Natural, soft look
        ctx.filter = 'brightness(1.05) contrast(1.05) saturate(1.1)';

        // Full image with soft overlay
        ctx.drawImage(resultImg, 0, 0, width, height);

        // Soft vignette
        const vignette = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 2);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
        break;
    }

    ctx.filter = 'none'; // Reset filter
  };

  const addBranding = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;

    // PAPI logo/text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAPI', width / 2, height - 100);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Hair Design', width / 2, height - 60);

    // Website URL
    ctx.fillStyle = '#FFD700';
    ctx.font = '24px Arial';
    ctx.fillText('papihairdesign.sk', width / 2, height - 20);
  };

  const addSocialText = (ctx: CanvasRenderingContext2D, hairstyle: string, color: string) => {
    const { width, height } = ctx.canvas;

    // Hashtag and description
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`✨ ${hairstyle} ✨`, width / 2, 80);

    // Color info
    ctx.fillStyle = color;
    ctx.font = '24px Arial';
    ctx.fillText(`Color: ${color}`, width / 2, 120);

    // Call to action
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 26px Arial';
    ctx.fillText('Rezervujte si termín!', width / 2, height - 150);
  };

  const addInstagramElements = (ctx: CanvasRenderingContext2D) => {
    const { width, height } = ctx.canvas;

    // Instagram-like elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(30, 30, 80, 80); // Story-like frame

    // Heart emoji
    ctx.fillStyle = '#FF69B4';
    ctx.font = '40px Arial';
    ctx.fillText('💖', width - 60, 60);

    // Trending hashtag
    ctx.fillStyle = '#FFD700';
    ctx.font = '20px Arial';
    ctx.fillText('#HairTransformation', 60, height - 200);
    ctx.fillText('#PAPIHairDesign', 60, height - 170);
  };

  const shareToPlatform = useCallback(async (platform: string) => {
    if (!generatedImage) {
      await generateSocialImage(selectedFilter);
    }

    const imageData = generatedImage || await generateSocialImage(selectedFilter).then(() => generatedImage);

    switch (platform) {
      case 'instagram':
        // In real app, this would open Instagram with the image
        console.log('Sharing to Instagram:', imageData);
        alert('Instagram sharing - in real app this would open Instagram app');
        break;
      case 'tiktok':
        console.log('Sharing to TikTok:', imageData);
        alert('TikTok sharing - in real app this would open TikTok app');
        break;
      case 'download':
        const link = document.createElement('a');
        link.download = `papi-hair-transformation-${Date.now()}.jpg`;
        link.href = imageData;
        link.click();
        break;
    }
  }, [generatedImage, selectedFilter, generateSocialImage]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-amber-400/30 rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              Profesionálne Sociálne Zdieľanie
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Filter Selection */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Vyberte filter</h3>
              <div className="space-y-3">
                {filters.map((filter) => (
                  <motion.div
                    key={filter.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedFilter === filter.id
                        ? 'bg-amber-400/20 border-2 border-amber-400 text-white'
                        : 'bg-gray-800/50 border-2 border-gray-600 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{filter.icon}</span>
                      <div>
                        <div className="font-semibold">{filter.name}</div>
                        <div className="text-sm opacity-80">{filter.description}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <button
                  onClick={() => generateSocialImage(selectedFilter)}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold py-4 px-6 rounded-xl hover:from-amber-300 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Generujem...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      Vygenerovať obrázok
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preview & Sharing */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Náhľad a zdieľanie</h3>

              {/* Generated Image Preview */}
              <div className="bg-gray-800/50 rounded-xl p-4 mb-6 aspect-square flex items-center justify-center">
                <canvas ref={canvasRef} className="hidden" />

                {generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated social media image"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p>Vyberte filter a vygenerujte obrázok</p>
                  </div>
                )}
              </div>

              {/* Social Sharing Buttons */}
              {generatedImage && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Zdieľať na:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => shareToPlatform('instagram')}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                      📸 Instagram
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => shareToPlatform('tiktok')}
                      className="bg-black text-white py-3 px-4 rounded-lg font-semibold border border-gray-600 flex items-center justify-center gap-2"
                    >
                      🎵 TikTok
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => shareToPlatform('download')}
                      className="bg-gray-800 text-white py-3 px-4 rounded-lg font-semibold border border-gray-600 flex items-center justify-center gap-2 col-span-2"
                    >
                      💾 Stiahnuť
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};