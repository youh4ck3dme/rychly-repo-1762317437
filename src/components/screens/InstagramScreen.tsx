import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../../lib/i18n.tsx";
import { Instagram, X } from "lucide-react";

interface InstagramScreenProps {
  onClose: () => void;
}

const galleryImages = [
  { src: "/assets/images/gallery-1.webp", aspect: "portrait" },
  { src: "/assets/images/gallery-2.webp", aspect: "square" },
  { src: "/assets/images/gallery-3.webp", aspect: "portrait" },
  { src: "/assets/images/gallery-4.webp", aspect: "square" },
  { src: "/assets/images/gallery-5.webp", aspect: "portrait" },
  { src: "/assets/images/gallery-6.webp", aspect: "square" },
  { src: "/assets/images/gallery-7.webp", aspect: "portrait" },
  { src: "/assets/images/gallery-8.webp", aspect: "square" },
  { src: "/assets/images/gallery-9.webp", aspect: "portrait" },
];

// FIX: Wrapped MasonryImage in React.memo and defined props with an interface. This helps TypeScript correctly identify it as a React component, resolving an error where the special 'key' prop was not being handled correctly during list rendering.
interface MasonryImageProps {
  src: string;
  index: number;
}

const MasonryImage = React.memo(({ src, index }: MasonryImageProps) => {
  // Simple logic to create a masonry effect by spanning rows
  const rowSpan = index % 5 === 0 ? "row-span-2" : "row-span-1";
  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg ${rowSpan}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <img
        src={src}
        alt={`Gallery image ${index + 1}`}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
});

// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler, resolving issues with `framer-motion` prop type inference.
export const InstagramScreen = React.memo(
  ({ onClose }: InstagramScreenProps) => {
    const { t } = useTranslation();

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black z-50 flex flex-col"
      >
        <header className="relative flex items-center justify-center p-4">
          <h1 className="text-2xl font-bold">{t("blog.instagram.title")}</h1>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close gallery"
          >
            <X size={24} />
          </button>
        </header>

        <div className="flex-grow p-2 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2 auto-rows-[100px]">
            {galleryImages.map((image, index) => (
              <MasonryImage key={index} src={image.src} index={index} />
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-800">
          <a
            href="https://www.instagram.com/papi_hair_design/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white text-black font-bold py-3 px-6 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors"
          >
            <Instagram size={20} />
            <span>{t("blog.instagram.follow")}</span>
          </a>
        </div>
      </motion.div>
    );
  },
);
