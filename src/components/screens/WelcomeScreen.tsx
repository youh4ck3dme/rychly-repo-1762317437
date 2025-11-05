


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../lib/i18n.tsx';

interface WelcomeScreenProps {
  onStart: () => void;
}

const backgroundImageUrl = '/assets/images/welcome-background.webp';

const diamondStars = [
  { top: '15%', left: '20%', size: 1.5 }, { top: '25%', left: '80%', size: 2 },
  { top: '50%', left: '10%', size: 1 }, { top: '60%', left: '90%', size: 1.5 },
  { top: '85%', left: '50%', size: 2 }, { top: '10%', left: '55%', size: 1 },
  { top: '30%', left: '30%', size: 1.5 }, { top: '70%', left: '75%', size: 1 },
  { top: '90%', left: '15%', size: 2 }, { top: '45%', left: '60%', size: 1 },
  { top: '5%', left: '5%', size: 1.5 }, { top: '75%', left: '35%', size: 1 },
];

// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler, resolving issues with `framer-motion` prop type inference.
const DiamondStars = React.memo(() => (
  <>
    {diamondStars.map((star, index) => (
      <motion.div
        key={index}
        className="fixed rounded-full bg-white"
        style={{
          top: star.top,
          left: star.left,
          width: `${star.size}px`,
          height: `${star.size}px`,
          boxShadow: '0 0 8px rgba(255, 255, 220, 0.9), 0 0 12px rgba(255, 255, 220, 0.5)',
        }}
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{
          duration: Math.random() * 4 + 3, // Duration between 3 and 7 seconds
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
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
    <div className="flex flex-col flex-grow bg-black">
      <div className="relative flex-grow flex flex-col justify-center text-white overflow-hidden">
        <motion.div 
            className="fixed inset-0 bg-cover bg-center"
            style={{
                backgroundImage: `url(${backgroundImageUrl})`,
                transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px) scale(1.1)`,
                transition: 'transform 0.5s ease-out',
                zIndex: -1
            }}
        />
        <div className="fixed inset-0 bg-black/50" style={{ zIndex: -1 }}></div>
        <DiamondStars />
        
        <main className="relative z-10 flex flex-col justify-end flex-grow p-8 animate-fade-in">
          <div className="absolute top-1/2 left-8 right-8 transform -translate-y-1/2 translate-y-5 text-center">
             <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-2xl font-bold bg-gradient-to-r from-yellow-300 via-white to-yellow-200 bg-clip-text text-transparent"
                style={{ textShadow: '0 2px 15px rgba(255, 215, 0, 0.3)' }}
            >
                {t('welcome.title')}
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-4 text-lg text-balance tracking-wide"
            >
                {t('welcome.subtitle')}
            </motion.p>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mt-2 text-xs text-gray-300 tracking-wider"
            >
                {t('welcome.tagline')}
            </motion.p>
          </div>
        </main>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative z-10 px-8 pb-8"
        >
            <motion.button
              onClick={onStart}
              className="w-full bg-gradient-to-b from-gray-900 to-black text-white font-bold py-4 px-6 rounded-lg border border-yellow-200/20 transition-shadow duration-300 flex flex-col items-center group animate-pulse-glow"
              whileHover={{ scale: 1.03, y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <span className="tracking-wider group-hover:tracking-widest transition-all duration-300">{t('welcome.button')}</span>
              <span className="text-[70%] font-normal text-yellow-200/80 tracking-widest mt-1 group-hover:text-white transition-colors duration-300">{t('welcome.buttonSubtitle')}</span>
            </motion.button>
        </motion.div>
      </div>
    </div>
  );
});