import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../lib/i18n.tsx';

interface BeforeAfterComparisonProps {
  isVisible: boolean;
  onClose: () => void;
  originalImage?: string;
  resultImage?: string;
  hairstyle?: string;
  color?: string;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({
  isVisible,
  onClose,
  originalImage,
  resultImage,
  hairstyle = 'Moderný účes',
  color = '#8B4513'
}) => {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<'split' | 'before' | 'after' | 'overlay'>('split');
  const [splitPercentage, setSplitPercentage] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeView !== 'split' || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPercentage(Math.max(0, Math.min(100, percentage)));
  };

  const startAnimation = () => {
    setIsAnimating(true);
    setActiveView('overlay');

    // Animate between before and after
    const interval = setInterval(() => {
      setActiveView(prev => prev === 'before' ? 'after' : 'before');
    }, 2000);

    setTimeout(() => {
      clearInterval(interval);
      setIsAnimating(false);
      setActiveView('split');
    }, 10000);
  };

  useEffect(() => {
    if (isVisible && originalImage && resultImage) {
      // Preload images for smooth transitions
      const preloadImages = [originalImage, resultImage];
      preloadImages.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    }
  }, [isVisible, originalImage, resultImage]);

  if (!isVisible || !originalImage || !resultImage) return null;

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
              Pred/Po Porovnanie
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

          {/* View Controls */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-800/50 rounded-xl p-2 flex gap-2">
              {[
                { id: 'split', label: 'Rozdelené', icon: '⚡' },
                { id: 'before', label: 'Pred', icon: '📸' },
                { id: 'after', label: 'Po', icon: '✨' },
                { id: 'overlay', label: 'Animácia', icon: '🎬' }
              ].map((view) => (
                <motion.button
                  key={view.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveView(view.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeView === view.id
                      ? 'bg-amber-400 text-black shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <span className="mr-2">{view.icon}</span>
                  {view.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Main Comparison Area */}
          <div className="relative">
            <div
              ref={containerRef}
              className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden cursor-col-resize"
              onMouseMove={handleMouseMove}
              style={{ cursor: activeView === 'split' ? 'col-resize' : 'default' }}
            >
              {/* Before Image (always visible in background) */}
              <img
                src={originalImage}
                alt="Before"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* After Image (overlay based on view mode) */}
              {activeView === 'split' && (
                <>
                  <div
                    className="absolute left-0 top-0 h-full overflow-hidden"
                    style={{ width: `${splitPercentage}%` }}
                  >
                    <img
                      src={originalImage}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className="absolute right-0 top-0 h-full overflow-hidden"
                    style={{ width: `${100 - splitPercentage}%` }}
                  >
                    <img
                      src={resultImage}
                      alt="After"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Split line */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-lg shadow-amber-400/50 z-10"
                    style={{ left: `${splitPercentage}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                      ⇄
                    </div>
                  </div>
                </>
              )}

              {activeView === 'before' && (
                <motion.img
                  key="before"
                  src={originalImage}
                  alt="Before"
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {activeView === 'after' && (
                <motion.img
                  key="after"
                  src={resultImage}
                  alt="After"
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {activeView === 'overlay' && (
                <AnimatePresence mode="wait">
                  <motion.img
                    key={isAnimating ? 'after' : 'before'}
                    src={isAnimating ? resultImage : originalImage}
                    alt={isAnimating ? "After" : "Before"}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                  />
                </AnimatePresence>
              )}

              {/* Overlay Labels */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-white text-sm font-medium">PRED</span>
              </div>
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                <span className="text-white text-sm font-medium">PO</span>
              </div>

              {/* Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="text-white text-center">
                  <p className="text-lg font-semibold">{hairstyle}</p>
                  <p className="text-sm text-gray-300">Farba: {color}</p>
                </div>
              </div>
            </div>

            {/* Animation Controls */}
            {activeView === 'overlay' && (
              <div className="mt-6 text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startAnimation}
                  disabled={isAnimating}
                  className="bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold py-3 px-6 rounded-lg hover:from-amber-300 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {isAnimating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Animujem...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 8a9 9 0 110-18 9 9 0 010 18z"></path>
                      </svg>
                      Spustiť animáciu
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView('split')}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
            >
              📊 Interaktívne porovnanie
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 transition-all"
            >
              📱 Zdieľať výsledok
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
            >
              💾 Stiahnuť porovnanie
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};