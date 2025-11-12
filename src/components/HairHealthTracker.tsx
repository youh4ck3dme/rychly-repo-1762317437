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
    try {
      const existing = localStorage.getItem("papi-hair-health-data");
      if (existing) {
        setHealthData(JSON.parse(existing));
      }
    } catch (error) {
      console.error("Failed to load hair health data from localStorage:", error);
      // Initialize with empty array if data is corrupted
      setHealthData([]);
    }
  }, []);

  const saveHealthData = (data: HairHealthData[]) => {
    try {
      localStorage.setItem("papi-hair-health-data", JSON.stringify(data));
      setHealthData(data);
    } catch (error) {
      console.error("Failed to save hair health data to localStorage:", error);
      // Still update state even if localStorage fails
      setHealthData(data);
    }
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-amber-400/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
              Hair Health Tracker
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-white"
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
          <div className="p-6 mb-8 border bg-gradient-to-r from-amber-900/20 to-amber-800/20 rounded-xl border-amber-400/30">
            <h3 className="mb-4 text-xl font-semibold text-amber-200">
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
          <div className="p-6 mb-8 bg-gray-800/50 rounded-xl">
            <h3 className="mb-4 text-xl font-semibold text-white">
              Pridať nový záznam
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
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
                  className="w-full px-4 py-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:border-amber-400 focus:outline-none"
                >
                  <option value="excellent">Výborný</option>
                  <option value="good">Dobrý</option>
                  <option value="fair">Priemerný</option>
                  <option value="poor">Slabý</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
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
                <div className="font-semibold text-center text-amber-400">
                  {newEntry.hydration}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
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
                <div className="font-semibold text-center text-amber-400">
                  {newEntry.shine}
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
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
                <div className="font-semibold text-center text-amber-400">
                  {newEntry.strength}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Poznámky (voliteľné)
              </label>
              <textarea
                value={newEntry.notes || ""}
                onChange={(e) =>
                  setNewEntry({ ...newEntry, notes: e.target.value })
                }
                className="w-full px-4 py-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:border-amber-400 focus:outline-none"
                rows={3}
                placeholder="Pridajte poznámky o vašich vlasoch..."
              />
            </div>

            <button
              onClick={addNewEntry}
              className="w-full px-6 py-3 mt-6 font-bold text-black transition-all transform rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 hover:scale-105"
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
              <div className="py-8 text-center text-gray-400">
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
              <div className="space-y-3 overflow-y-auto max-h-64">
                {healthData.map((entry, index) => (
                  <motion.div
                    key={entry.date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-lg bg-gray-800/30 border-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-3">
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
                        <div className="font-semibold text-blue-400">
                          {entry.hydration}/10
                        </div>
                        <div className="text-gray-400">Hydratácia</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-amber-400">
                          {entry.shine}/10
                        </div>
                        <div className="text-gray-400">Lesk</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-400">
                          {entry.strength}/10
                        </div>
                        <div className="text-gray-400">Sila</div>
                      </div>
                    </div>

                    {entry.notes && (
                      <div className="pt-3 mt-3 border-t border-gray-700/50">
                        <p className="text-sm text-gray-300">{entry.notes}</p>
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
