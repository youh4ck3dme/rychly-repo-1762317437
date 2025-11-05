

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../lib/i18n.tsx';

interface PhotoGalleryProps {
  photos: string[];
  onSelectPhoto: (imageDataUrl: string) => void;
}

export const PhotoGallery = React.memo(({ photos, onSelectPhoto }: PhotoGalleryProps) => {
  const { t } = useTranslation();
  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-sm mx-auto mt-4">
      <h3 className="text-xs text-center text-gray-400 mb-2 uppercase tracking-wider">{t('upload.recentPhotos')}</h3>
      <div className="grid grid-cols-4 gap-2">
        {photos.map((photo, index) => (
          <motion.div
            key={index}
            className="aspect-square rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-yellow-300 transition-colors"
            onClick={() => onSelectPhoto(photo)}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <img src={photo} alt={`${t('upload.recentPhotoAlt')} ${index + 1}`} className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>
    </div>
  );
});