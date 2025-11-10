import { db } from "../context/AuthContext";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";

const storage = getStorage(db.app);

/**
 * Creates a unique session ID for sharing.
 * @returns A random string to be used as a document ID.
 */
const generateSessionId = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Creates a new share session document in Firestore.
 * @param userImage - The base64 encoded user image to be shared.
 * @returns The generated session ID, or null on error.
 */
export const createShareSession = async (
  userImage: string,
): Promise<string | null> => {
  try {
    const sessionId = generateSessionId();
    const sessionRef = doc(db, "sharedSessions", sessionId);
    await setDoc(sessionRef, {
      userImage,
      createdAt: serverTimestamp(),
    });
    console.log(`Share session created with ID: ${sessionId}`);
    return sessionId;
  } catch (error) {
    console.error("Error creating share session in Firestore:", error);
    return null;
  }
};

/**
 * Retrieves a shared session's image from Firestore.
 * @param sessionId - The ID of the session to retrieve.
 * @returns The base64 encoded user image, or null if not found or on error.
 */
export const getShareSession = async (
  sessionId: string,
): Promise<string | null> => {
  try {
    const sessionRef = doc(db, "sharedSessions", sessionId);
    const docSnap = await getDoc(sessionRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.userImage || null;
    } else {
      console.warn(`Share session with ID "${sessionId}" not found.`);
      return null;
    }
  } catch (error) {
    console.error("Error getting share session from Firestore:", error);
    return null;
  }
};

/**
 * Uploads a base64 image to Firebase Storage for sharing.
 * IMPORTANT: Requires Firebase Storage rules to allow public writes to 'shared-results/'.
 * @param base64Image - The base64 encoded image data (with data URL prefix).
 * @returns The public URL of the uploaded image, or null on error.
 */
export const uploadImageForSharing = async (
  base64Image: string,
): Promise<string | null> => {
  try {
    const [meta, data] = base64Image.split(",");
    if (!data) throw new Error("Invalid base64 string");

    const fileName = `try-on-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.jpeg`;
    const storageRef = ref(storage, `shared-results/${fileName}`);

    const snapshot = await uploadString(storageRef, data, "base64", {
      contentType: "image/jpeg",
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log("Image uploaded for sharing:", downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading image for sharing:", error);
    return null;
  }
};
