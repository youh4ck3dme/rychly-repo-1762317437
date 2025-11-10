import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../lib/i18n.tsx";

interface TimeSlot {
  time: string;
  available: boolean;
  recommended?: boolean;
}

interface SmartBookingProps {
  isVisible: boolean;
  onClose: () => void;
  selectedServices?: string[];
}

export const SmartBooking: React.FC<SmartBookingProps> = ({
  isVisible,
  onClose,
  selectedServices = [],
}) => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate next 14 days for date selection
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      value: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("sk-SK", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      isToday: i === 0,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    };
  });

  // Generate time slots based on selected date
  const getTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const isWeekend =
      new Date(date).getDay() === 0 || new Date(date).getDay() === 6;

    // Weekend hours: 9:00 - 16:00
    // Weekday hours: 8:00 - 18:00
    const startHour = isWeekend ? 9 : 8;
    const endHour = isWeekend ? 16 : 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

        // Mock availability - in real app this would come from API
        const isAvailable = Math.random() > 0.3; // 70% availability

        // Mark some slots as recommended based on AI
        const isRecommended =
          selectedServices.length > 0 && Math.random() > 0.7;

        slots.push({
          time: timeString,
          available: isAvailable,
          recommended: isRecommended,
        });
      }
    }

    return slots;
  };

  const timeSlots = selectedDate ? getTimeSlots(selectedDate) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !customerName || !customerPhone)
      return;

    setIsSubmitting(true);

    try {
      // Here you would send the booking to your API
      const bookingData = {
        date: selectedDate,
        time: selectedTime,
        service: selectedService,
        customerName,
        customerPhone,
        customerEmail,
        notes,
        services: selectedServices,
      };

      // console.log('Booking data:', bookingData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message
      alert("Termín bol úspešne rezervovaný!");

      // Reset form
      setSelectedDate("");
      setSelectedTime("");
      setSelectedService("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setNotes("");

      onClose();
    } catch (error) {
      console.error("Booking error:", error);
      alert("Nastala chyba pri rezervácii. Skúste to znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          className="bg-gradient-to-br from-gray-900 to-black border border-amber-400/30 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              Smart Booking System
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              title="Zavrieť booking"
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Selected Services */}
            {selectedServices.length > 0 && (
              <div className="bg-amber-900/20 border border-amber-400/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-amber-200 mb-4">
                  Vybrané služby
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedServices.map((service, index) => (
                    <span
                      key={index}
                      className="bg-amber-400/20 text-amber-200 px-3 py-1 rounded-full text-sm border border-amber-400/30"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <label className="block text-lg font-medium text-white mb-4">
                Vyberte dátum
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                {availableDates.map((date) => (
                  <motion.button
                    key={date.value}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(date.value)}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedDate === date.value
                        ? "bg-amber-400 text-black shadow-lg shadow-amber-400/50"
                        : date.isWeekend
                          ? "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600"
                          : "bg-gray-800/70 text-white hover:bg-gray-700 border border-gray-600"
                    }`}
                  >
                    <div className="text-xs mb-1">
                      {date.isToday ? "DNES" : date.label.split(" ")[0]}
                    </div>
                    <div className="font-semibold">
                      {new Date(date.value).getDate()}
                    </div>
                    <div className="text-xs">
                      {date.label.split(" ").slice(1).join(" ")}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <label className="block text-lg font-medium text-white">
                  Vyberte čas
                </label>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {timeSlots.map((slot) => (
                    <motion.button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      whileHover={slot.available ? { scale: 1.05 } : {}}
                      whileTap={slot.available ? { scale: 0.95 } : {}}
                      onClick={() =>
                        slot.available && setSelectedTime(slot.time)
                      }
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === slot.time
                          ? "bg-amber-400 text-black shadow-lg"
                          : slot.available
                            ? slot.recommended
                              ? "bg-green-600/20 text-green-300 border border-green-400/50 hover:bg-green-600/30"
                              : "bg-gray-800/70 text-white hover:bg-gray-700 border border-gray-600"
                            : "bg-gray-900/50 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {slot.time}
                      {slot.recommended && (
                        <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mt-1 animate-pulse"></div>
                      )}
                    </motion.button>
                  ))}
                </div>
                <p className="text-sm text-gray-400">
                  <span className="inline-block w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                  Odporúčané časy na základe AI
                </p>
              </motion.div>
            )}

            {/* Service Selection */}
            <div>
              <label className="block text-lg font-medium text-white mb-4">
                Služba (voliteľné)
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-4 border border-gray-600 focus:border-amber-400 focus:outline-none"
                title="Vyberte službu"
                aria-label="Vyberte službu"
              >
                <option value="">Vyberte službu</option>
                <option value="Dámske strihanie">Dámske strihanie</option>
                <option value="Pánske strihanie">Pánske strihanie</option>
                <option value="Farbenie vlasov">Farbenie vlasov</option>
                <option value="Balayage & Melír">Balayage & Melír</option>
                <option value="Ošetrenie vlasov">Ošetrenie vlasov</option>
                <option value="Svadobné účesy">Svadobné účesy</option>
              </select>
            </div>

            {/* Customer Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meno *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-amber-400 focus:outline-none"
                  required
                  title="Meno"
                  placeholder="Zadajte meno"
                  aria-label="Meno"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefón *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-amber-400 focus:outline-none"
                  required
                  title="Telefón"
                  placeholder="Zadajte telefón"
                  aria-label="Telefón"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email (voliteľné)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-amber-400 focus:outline-none"
                  title="Email"
                  placeholder="Zadajte email"
                  aria-label="Email"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Poznámky (voliteľné)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-amber-400 focus:outline-none"
                rows={3}
                placeholder="Špeciálne požiadavky alebo poznámky..."
                title="Poznámky"
                aria-label="Poznámky"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                !selectedDate ||
                !selectedTime ||
                !customerName ||
                !customerPhone ||
                isSubmitting
              }
              className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold py-4 px-8 rounded-xl hover:from-amber-300 hover:to-amber-500 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Rezervujem...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  Rezervovať termín
                </>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
