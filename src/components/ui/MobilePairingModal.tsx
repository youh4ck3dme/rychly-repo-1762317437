import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone } from "lucide-react";
import { useTranslation } from "../../lib/i18n.tsx";

interface MobilePairingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const qrCodeUrl = "/assets/images/qr-code.png";

export const MobilePairingModal = React.memo(
  ({ isOpen, onClose }: MobilePairingModalProps) => {
    const { t } = useTranslation();

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-gray-900 border border-yellow-400/20 rounded-xl shadow-2xl w-full max-w-sm text-center p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                aria-label={t("modal.pairing.close")}
              >
                <X size={24} />
              </button>

              <div className="mx-auto w-16 h-16 bg-yellow-400/10 text-yellow-300 rounded-full flex items-center justify-center border-2 border-yellow-400/30">
                <Smartphone size={32} />
              </div>

              <h2 className="text-xl font-bold mt-4">
                {t("modal.pairing.title")}
              </h2>
              <p className="text-gray-400 mt-1">
                {t("modal.pairing.subtitle")}
              </p>

              <div className="my-6 space-y-3 text-left text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex-shrink-0 bg-gray-800 text-yellow-300 rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <p>{t("modal.pairing.step1")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex-shrink-0 bg-gray-800 text-yellow-300 rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <p>{t("modal.pairing.step2")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex-shrink-0 bg-gray-800 text-yellow-300 rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <p>{t("modal.pairing.step3")}</p>
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg inline-block">
                <img
                  src={qrCodeUrl}
                  alt="QR Code to connect mobile device"
                  width="150"
                  height="150"
                  loading="lazy"
                />
              </div>

              <button
                onClick={onClose}
                className="w-full mt-6 bg-gray-700 font-bold py-3 rounded-md hover:bg-gray-600 transition-colors"
              >
                {t("modal.pairing.close")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);
