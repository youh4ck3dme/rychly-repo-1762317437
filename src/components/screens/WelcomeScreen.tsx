


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../lib/i18n.tsx';

interface WelcomeScreenProps {
  onStart: () => void;
}

const backgroundImageUrl = '/assets/images/welcome-background.webp';

const stars = Array.from({ length: 250 }, (_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  brightness: Math.random() * 0.8 + 0.2,
  twinkleDelay: Math.random() * 5,
}));

// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler, resolving issues with `framer-motion` prop type inference.
const StarrySky = React.memo(() => (
  <>
    {stars.map((star) => (
      <motion.div
        key={star.id}
        className="absolute bg-white rounded-full"
        style={{
          top: `${star.top}%`,
          left: `${star.left}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          opacity: star.brightness,
          boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.brightness * 0.8})`,
        }}
        animate={{
          opacity: [star.brightness * 0.3, star.brightness, star.brightness * 0.3],
          scale: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2 + Math.random() * 3,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
          delay: star.twinkleDelay,
        }}
      />
    ))}
  </>
));


// FIX: Removed React.FC and explicitly typed props to improve type compatibility.
// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler, resolving issues with `framer-motion` prop type inference.
export const WelcomeScreen = React.memo(({ onStart }: WelcomeScreenProps) => {
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const { t } = useTranslation();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { innerWidth, innerHeight } = window;
      const xOffset = (clientX / innerWidth - 0.5) * 40; // Multiplier controls effect strength
      const yOffset = (clientY / innerHeight - 0.5) * 40;
      setParallaxOffset({ x: -xOffset, y: -yOffset });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="flex flex-col flex-grow min-h-screen bg-black">
      <div className="relative flex flex-col justify-center flex-grow min-h-screen overflow-hidden text-white">
        <div className="fixed inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-black -z-10"></div>
        <StarrySky />
        
        <main className="relative z-10 flex flex-col justify-end flex-grow p-8 animate-fade-in">
          <div className="absolute text-center -translate-y-1/2 top-1/2 left-8 right-8">
             <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-2xl font-bold text-transparent bg-gradient-to-r from-yellow-300 via-white to-yellow-200 bg-clip-text"
                style={{ textShadow: '0 2px 15px rgba(255, 215, 0, 0.3)' }}
            >
                {t('welcome.title')}
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-4 text-lg tracking-wide text-balance"
            >
                {t('welcome.subtitle')}
            </motion.p>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-2 text-xs tracking-wider text-gray-300"
            >
                {t('welcome.tagline')}
            </motion.p>
          </div>
        </main>

        {process.env.NODE_ENV === 'development' && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative z-10 px-8 pb-8"
        >
            <motion.button
              onClick={onStart}
              className="flex flex-col items-center w-full px-6 py-4 font-bold text-white transition-shadow duration-300 border rounded-lg bg-gradient-to-b from-gray-900 to-black border-yellow-200/20 group animate-pulse-glow"
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <span className="tracking-wider transition-all duration-300 group-hover:tracking-widest">{t('welcome.button')}</span>
              <span className="text-[70%] font-normal text-yellow-200/80 tracking-widest mt-1 group-hover:text-white transition-colors duration-300">{t('welcome.buttonSubtitle')}</span>
            </motion.button>
        </motion.div>
        )}
      </div>
    </div>
  );
});