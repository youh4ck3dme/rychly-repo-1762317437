import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import { firebaseConfig, VAPID_KEY } from "../config/firebaseConfig";
import { db } from "../context/AuthContext"; // Import db from AuthContext to use its initialized app

// The app is now initialized in AuthContext, so we use db.app
// const app = initializeApp(firebaseConfig);
let messagingInstance: any = null;

// Asynchronously check for support and initialize messaging
const initializeMessaging = async () => {
  const supported = await isSupported();
  if (supported) {
    // Use the app instance initialized in AuthContext
    messagingInstance = getMessaging(db.app);
  } else {
    console.warn("Firebase Messaging is not supported in this browser.");
  }
  return supported;
};

const messagingInitialized = initializeMessaging();

/**
 * Requests permission to receive push notifications and returns the token.
 * @returns {Promise<string | null>} The FCM token or null if permission is denied or an error occurs.
 */
export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  await messagingInitialized;
  if (!messagingInstance) {
    console.error("Firebase Messaging not initialized or supported.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("Notification permission granted.");
      const currentToken = await getToken(messagingInstance, {
        vapidKey: VAPID_KEY,
      });
      if (currentToken) {
        console.log("FCM Token:", currentToken);
        // Here you would typically send the token to your server to store it.
        return currentToken;
      } else {
        console.log(
          "No registration token available. Request permission to generate one.",
        );
        return null;
      }
    } else {
      console.log("Unable to get permission to notify.");
      return null;
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
};

/**
 * Sets up a listener for foreground messages (when the app is the active tab).
 * @param {function} callback - The function to call when a message is received.
 */
export const onForegroundMessageListener = (
  callback: (payload: any) => void,
) => {
  messagingInitialized.then((supported) => {
    if (supported && messagingInstance) {
      return onMessage(messagingInstance, (payload) => {
        console.log("Received foreground message: ", payload);
        callback(payload);
      });
    }
  });
  return () => {}; // Return an empty unsubscribe function if not supported
};

/**
 * Checks if push notifications are supported by the browser.
 * @returns {Promise<boolean>}
 */
export const isPushSupported = isSupported;
