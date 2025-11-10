import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../lib/i18n.tsx";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  rating: number;
  image: string;
  description: string;
  category: "shampoo" | "conditioner" | "treatment" | "styling" | "color";
  benefits: string[];
  suitableFor: string[];
  aiRecommended?: boolean;
  matchScore?: number;
}

interface ProductRecommendationsProps {
  hairType?: string;
  hairCondition?: string;
  selectedServices?: string[];
  isVisible: boolean;
  onClose: () => void;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  hairType,
  hairCondition,
  selectedServices = [],
  isVisible,
  onClose,
}) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate AI-powered product recommendations
    const generateRecommendations = () => {
      setIsLoading(true);

      // Mock product database - in real app this would come from API
      const productDatabase: Product[] = [
        {
          id: "1",
          name: "Kerastase Nutritive Bain Satin",
          brand: "Kerastase",
          price: "€28",
          rating: 4.8,
          image: "/assets/products/kerastase-shampoo.jpg",
          description: "Výživný šampón pre suché a poškodené vlasy",
          category: "shampoo",
          benefits: [
            "Hĺbková výživa",
            "Obnova poškodených vlasov",
            "Lesk a hebkosť",
          ],
          suitableFor: ["damaged", "dry", "normal"],
        },
        {
          id: "2",
          name: "L'Oreal Professionnel Serie Expert",
          brand: "L'Oreal",
          price: "€24",
          rating: 4.6,
          image: "/assets/products/loreal-conditioner.jpg",
          description: "Profesionálny kondicionér pre všetky typy vlasov",
          category: "conditioner",
          benefits: ["Hydratácia", "Ochrana farby", "Jednoduché rozčesávanie"],
          suitableFor: ["all", "colored", "normal"],
        },
        {
          id: "3",
          name: "Olaplex No.3 Hair Perfector",
          brand: "Olaplex",
          price: "€35",
          rating: 4.9,
          image: "/assets/products/olaplex-treatment.jpg",
          description: "Revolučné ošetrenie pre obnovu vlasových väzieb",
          category: "treatment",
          benefits: [
            "Obnova poškodených vlasov",
            "Posilnenie",
            "Prevencia lámavosti",
          ],
          suitableFor: ["damaged", "bleached", "weak"],
        },
        {
          id: "4",
          name: "Redken Shades EQ",
          brand: "Redken",
          price: "€19",
          rating: 4.7,
          image: "/assets/products/redken-color.jpg",
          description: "Profesionálna farba na vlasy bez amoniaku",
          category: "color",
          benefits: ["Šetrné farbenie", "Lesk", "Výživa vlasov"],
          suitableFor: ["colored", "normal", "damaged"],
        },
        {
          id: "5",
          name: "Moroccanoil Treatment",
          brand: "Moroccanoil",
          price: "€42",
          rating: 4.8,
          image: "/assets/products/moroccanoil-oil.jpg",
          description: "Argánový olej pre všetky typy vlasov",
          category: "styling",
          benefits: [
            "Lesk a hebkosť",
            "Ochrana pred teplom",
            "Rýchle schnutie",
          ],
          suitableFor: ["all", "frizzy", "dull"],
        },
      ];

      // AI-powered filtering based on user data
      let filteredProducts = productDatabase;

      // Filter by hair condition
      if (hairCondition === "damaged") {
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.suitableFor.includes("damaged") ||
            p.benefits.some(
              (b) => b.includes("obnova") || b.includes("posilnenie"),
            ),
        );
      } else if (hairCondition === "dry") {
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.suitableFor.includes("dry") ||
            p.benefits.some(
              (b) => b.includes("hydratácia") || b.includes("výživa"),
            ),
        );
      }

      // Filter by selected services
      if (selectedServices.some((s) => s.toLowerCase().includes("farbenie"))) {
        filteredProducts = filteredProducts.filter(
          (p) => p.category === "color" || p.suitableFor.includes("colored"),
        );
      }

      // Add AI confidence scores
      filteredProducts = filteredProducts.map((product) => ({
        ...product,
        aiRecommended: Math.random() > 0.3, // 70% AI recommendation rate
        matchScore: Math.floor(Math.random() * 30) + 70, // 70-100% match score
      }));

      // Sort by AI recommendation and match score
      filteredProducts.sort((a, b) => {
        if (a.aiRecommended && !b.aiRecommended) return -1;
        if (!a.aiRecommended && b.aiRecommended) return 1;
        return (b.matchScore || 0) - (a.matchScore || 0);
      });

      setTimeout(() => {
        setProducts(filteredProducts);
        setIsLoading(false);
      }, 1500); // Simulate API call
    };

    if (isVisible) {
      generateRecommendations();
    }
  }, [isVisible, hairType, hairCondition, selectedServices]);

  const categories = [
    { id: "all", name: "Všetky produkty" },
    { id: "shampoo", name: "Šampóny" },
    { id: "conditioner", name: "Kondicionéry" },
    { id: "treatment", name: "Ošetrenia" },
    { id: "styling", name: "Styling" },
    { id: "color", name: "Farby" },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

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
              AI Produktové odporúčania
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-amber-400 text-black shadow-lg"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
                  }`}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-amber-200 font-medium">
                  AI analyzuje vaše vlasy...
                </p>
                <p className="text-gray-400 text-sm">
                  Hľadáme tie najlepšie produkty pre vás
                </p>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50 hover:border-amber-400/30 transition-all group"
                >
                  {/* AI Recommended Badge */}
                  {product.aiRecommended && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        ></path>
                      </svg>
                      AI Odporúčané
                    </div>
                  )}

                  <div className="aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <svg
                        className="w-12 h-12 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        ></path>
                      </svg>
                      <p className="text-sm">{product.brand}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {product.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-amber-400 font-bold text-xl">
                        {product.price}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-amber-400" : "text-gray-600"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-400 text-sm">
                          ({product.rating})
                        </span>
                      </div>
                    </div>

                    {/* AI Match Score */}
                    <div className="bg-amber-900/20 rounded-lg p-3 border border-amber-400/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-amber-200 text-sm font-medium">
                          AI Match Score
                        </span>
                        <span className="text-amber-400 font-bold">
                          {product.matchScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${product.matchScore}%` }}
                          transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                          className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full"
                        ></motion.div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div>
                      <h4 className="text-white font-medium text-sm mb-2">
                        Výhody:
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {product.benefits.slice(0, 3).map((benefit, i) => (
                          <span
                            key={i}
                            className="bg-gray-700/50 text-gray-300 text-xs px-2 py-1 rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-gradient-to-r from-amber-400/20 to-amber-600/20 border border-amber-400/30 text-amber-200 py-3 rounded-lg hover:from-amber-400/30 hover:to-amber-600/30 transition-all font-medium group-hover:bg-amber-400/10">
                      Zobraziť detail
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* No Products Message */}
          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                ></path>
              </svg>
              <p className="text-gray-400 text-lg">
                Žiadne produkty v tejto kategórii
              </p>
              <p className="text-gray-500 text-sm">
                Skúste inú kategóriu alebo filtre
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
