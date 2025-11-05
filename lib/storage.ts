
const PHOTO_HISTORY_KEY = 'photoHistory';
const MAX_HISTORY_LENGTH = 4;

export const savePhoto = (imageDataUrl: string): void => {
  try {
    const history = getPhotoHistory();
    // Add new photo to the beginning, removing duplicates
    const newHistory = [imageDataUrl, ...history.filter(url => url !== imageDataUrl)];
    // Trim the history to the max length
    if (newHistory.length > MAX_HISTORY_LENGTH) {
      newHistory.length = MAX_HISTORY_LENGTH;
    }
    localStorage.setItem(PHOTO_HISTORY_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error("Failed to save photo to local storage:", error);
  }
};

export const getPhotoHistory = (): string[] => {
  try {
    const historyJson = localStorage.getItem(PHOTO_HISTORY_KEY);
    if (historyJson) {
      const history = JSON.parse(historyJson);
      if (Array.isArray(history)) {
        return history;
      }
    }
  } catch (error) {
    console.error("Failed to retrieve photo history from local storage:", error);
  }
  return [];
};
