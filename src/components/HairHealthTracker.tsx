import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../lib/i18n.tsx";

interface HairHealthData {
  date: string;
  condition: "excellent" | "good" | "fair" | "poor";
  hydration: number;
  shine: number;
  strength: number;
  notes?: string;
}

interface HairHealthTrackerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const HairHealthTracker: React.FC<HairHealthTrackerProps> = ({
  isVisible,
  onClose,
}) => {
  const { t } = useTranslation();
  const [healthData, setHealthData] = useState<HairHealthData[]>([]);
  const [newEntry, setNewEntry] = useState<Partial<HairHealthData>>({
    condition: "good",
    hydration: 5,
    shine: 5,
    strength: 5,
  });

  useEffect(() => {
    // Load existing data from localStorage
    const existing = localStorage.getItem("papi-hair-health-data");
    if (existing) {
      setHealthData(JSON.parse(existing));
    }
  }, []);

  const saveHealthData = (data: HairHealthData[]) => {
    localStorage.setItem("papi-hair-health-data", JSON.stringify(data));
    setHealthData(data);
  };

  const addNewEntry = () => {
    if (
      !newEntry.condition ||
      !newEntry.hydration ||
      !newEntry.shine ||
      !newEntry.strength
    )
      return;

    const entry: HairHealthData = {
      date: new Date().toISOString(),
      condition: newEntry.condition as HairHealthData["condition"],
      hydration: newEntry.hydration as number,
      shine: newEntry.shine as number,
      strength: newEntry.strength as number,
      notes: newEntry.notes,
    };

    const updated = [entry, ...healthData];
    saveHealthData(updated);

    // Reset form
    setNewEntry({
      condition: "good",
      hydration: 5,
      shine: 5,
      strength: 5,
      notes: "",
    });
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "text-green-400 bg-green-400/20";
      case "good":
        return "text-blue-400 bg-blue-400/20";
      case "fair":
        return "text-yellow-400 bg-yellow-400/20";
      case "poor":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  const getAverageScore = () => {
    if (healthData.length === 0) return 0;
    const recent = healthData.slice(0, 7); // Last 7 entries
    const avg =
      recent.reduce(
        (acc, entry) =>
          acc + (entry.hydration + entry.shine + entry.strength) / 3,
        0,
      ) / recent.length;
    return Math.round(avg * 10) / 10;
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
          className="bg-gradient-to-br from-gray-900 to-black border border-amber-400/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              Hair Health Tracker
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

          {/* Current Health Score */}
          <div className="bg-gradient-to-r from-amber-900/20 to-amber-800/20 rounded-xl p-6 mb-8 border border-amber-400/30">
            <h3 className="text-xl font-semibold text-amber-200 mb-4">
              Aktuálne skóre zdravia vlasov
            </h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div
                  className={`text-4xl font-bold ${getConditionColor(
                    healthData.length > 0
                      ? getAverageScore() >= 8
                        ? "excellent"
                        : getAverageScore() >= 6
                          ? "good"
                          : getAverageScore() >= 4
                            ? "fair"
                            : "poor"
                      : "good",
                  )}`}
                >
                  {getAverageScore()}/10
                </div>
                <div className="text-sm text-gray-400">Priemerné skóre</div>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-400">
                      {healthData.length > 0
                        ? Math.round(
                            healthData.reduce(
                              (acc, d) => acc + d.hydration,
                              0,
                            ) / healthData.length,
                          )
                        : 5}
                    </div>
                    <div className="text-xs text-gray-400">Hydratácia</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-400">
                      {healthData.length > 0
                        ? Math.round(
                            healthData.reduce((acc, d) => acc + d.shine, 0) /
                              healthData.length,
                          )
                        : 5}
                    </div>
                    <div className="text-xs text-gray-400">Lesk</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {healthData.length > 0
                        ? Math.round(
                            healthData.reduce((acc, d) => acc + d.strength, 0) /
                              healthData.length,
                          )
                        : 5}
                    </div>
                    <div className="text-xs text-gray-400">Sila</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add New Entry */}
          <div className="bg-gray-800/50 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Pridať nový záznam
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stav vlasov
                </label>
                <select
                  value={newEntry.condition}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      condition: e.target.value as HairHealthData["condition"],
                    })
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-amber-400 focus:outline-none"
                >
                  <option value="excellent">Výborný</option>
                  <option value="good">Dobrý</option>
                  <option value="fair">Priemerný</option>
                  <option value="poor">Slabý</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hydratácia (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newEntry.hydration}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      hydration: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="text-center text-amber-400 font-semibold">
                  {newEntry.hydration}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lesk (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newEntry.shine}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      shine: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="text-center text-amber-400 font-semibold">
                  {newEntry.shine}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sila (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newEntry.strength}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      strength: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="text-center text-amber-400 font-semibold">
                  {newEntry.strength}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Poznámky (voliteľné)
              </label>
              <textarea
                value={newEntry.notes || ""}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, notes: e.target.value })
                }
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-amber-400 focus:outline-none"
                rows={3}
                placeholder="Pridajte poznámky o vašich vlasoch..."
              />
            </div>

            <button
              onClick={addNewEntry}
              className="w-full mt-6 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold py-3 px-6 rounded-lg hover:from-amber-300 hover:to-amber-500 transition-all transform hover:scale-105"
            >
              Pridať záznam
            </button>
          </div>

          {/* Health History */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">
              História záznamov
            </h3>
            {healthData.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <svg
                  className="w-12 h-12 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  ></path>
                </svg>
                <p>Žiadne záznamy</p>
                <p className="text-sm">
                  Pridajte prvý záznam o zdraví vašich vlasov
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {healthData.map((entry, index) => (
                  <motion.div
                    key={entry.date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(entry.condition)}`}
                      >
                        {entry.condition === "excellent"
                          ? "Výborný"
                          : entry.condition === "good"
                            ? "Dobrý"
                            : entry.condition === "fair"
                              ? "Priemerný"
                              : "Slabý"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-blue-400 font-semibold">
                          {entry.hydration}/10
                        </div>
                        <div className="text-gray-400">Hydratácia</div>
                      </div>
                      <div className="text-center">
                        <div className="text-amber-400 font-semibold">
                          {entry.shine}/10
                        </div>
                        <div className="text-gray-400">Lesk</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 font-semibold">
                          {entry.strength}/10
                        </div>
                        <div className="text-gray-400">Sila</div>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-700/50">
                        <p className="text-gray-300 text-sm">{entry.notes}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
