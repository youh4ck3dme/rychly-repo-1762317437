import React from "react";
import { serviceCategories } from "../../data/products";
// FIX: Explicitly typed framer-motion variants with the 'Variants' type to resolve a TypeScript type inference issue.
import { motion, Variants } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslation } from "../../lib/i18n.tsx";

interface ServicesScreenProps {
  activeServices: string[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const categoryVisuals: { [key: string]: { image: string } } = {
  "services.categories.damske": {
    image: "/assets/images/services-damske.webp",
  },
  "services.categories.panske": {
    image: "/assets/images/services-panske.webp",
  },
};

// FIX: Wrapped component in `React.memo` to stabilize its type for the TypeScript compiler, resolving issues with `framer-motion` prop type inference.
export const ServicesScreen = React.memo(
  ({ activeServices }: ServicesScreenProps) => {
    const { t } = useTranslation();
    return (
      <div className="flex flex-col flex-grow bg-black text-white">
        <main className="flex-grow flex flex-col p-4">
          <h1 className="text-3xl font-bold text-center mb-8 tracking-wide">
            {t("services.title")}
          </h1>
          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {serviceCategories.map((category) => {
              const visuals = categoryVisuals[category.nameKey];
              return (
                <motion.div
                  key={category.nameKey}
                  variants={itemVariants}
                  className="relative rounded-xl overflow-hidden border border-gray-800"
                >
                  <img
                    src={visuals.image}
                    alt={t(category.nameKey)}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50"></div>
                  <div className="relative p-6">
                    <h3
                      className="text-3xl font-bold text-yellow-300 mb-6 tracking-wider"
                      style={{
                        textShadow: "0 2px 10px rgba(255, 215, 0, 0.3)",
                      }}
                    >
                      {t(category.nameKey)}
                    </h3>
                    <motion.div
                      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.3 }}
                    >
                      {category.subcategories.map((subcategory) => (
                        <motion.div
                          key={subcategory.name}
                          variants={itemVariants}
                          className="bg-black/50 backdrop-blur-sm rounded-lg p-4 border border-white/10 transition-all duration-300 hover:border-yellow-300/30 hover:shadow-lg hover:shadow-yellow-400/10"
                          whileHover={{ y: -5 }}
                        >
                          <h4 className="font-bold text-lg mb-3 text-white tracking-wide">
                            {subcategory.name}
                          </h4>
                          <ul className="space-y-3">
                            {subcategory.items.map((item) => {
                              const isRecommended = activeServices.includes(
                                item.name,
                              );
                              return (
                                <li
                                  key={item.name}
                                  className={`flex justify-between items-center transition-all border-b border-gray-800 pb-2 last:border-b-0 ${isRecommended ? "text-white" : "text-gray-300"}`}
                                >
                                  <div className="flex items-center gap-2">
                                    {isRecommended && (
                                      <Star
                                        size={14}
                                        className="text-yellow-400 fill-yellow-400"
                                      />
                                    )}
                                    <span
                                      className={`${isRecommended ? "font-bold" : ""}`}
                                    >
                                      {item.name}
                                    </span>
                                  </div>
                                  <span
                                    className={`font-semibold ${isRecommended ? "text-yellow-300" : "text-gray-400"}`}
                                  >
                                    {item.price}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          <p className="text-xs text-gray-500 mt-8 text-center px-4 pb-8">
            {t("services.note")}
          </p>
        </main>
      </div>
    );
  },
);
