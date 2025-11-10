// config/firebaseConfig.ts

// Tieto hodnoty by mali byť načítané z premenných prostredia
// (napr. cez `.env` súbor s prefixom `VITE_` ak používate Vite).
// They are NOT to be hardcoded in a production environment for security.

export const firebaseConfig = {
  // FIX: Add non-null assertions to process.env variables.
  // This tells TypeScript that these values are expected to be strings at runtime,
  // preventing potential 'string | undefined' type conflicts with Firebase SDK expectations.
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.FIREBASE_APP_ID!,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID, // Optional, can be undefined
};

// =====================================================================================
// !!! DÔLEŽITÉ UPOZORNENIE / IMPORTANT NOTICE !!!
// =====================================================================================
// TOTO JE VÁŠ VAPID KĽÚČ Z PROJEKTOVÝCH NASTAVENÍ FIREBASE -> Cloud Messaging -> Web Push certifikáty.
// Bez neho NEBUDÚ fungovať push notifikácie. Ak ho nemáte, vygenerujte si nový pár kľúčov
// a vložte verejný kľúč (public key) sem.
// Mal by byť tiež načítaný z premennej prostredia.
//
// This is your VAPID key from Firebase project settings -> Cloud Messaging -> Web Push certificates.
// Without it, push notifications WILL NOT WORK. Generate a new key pair if you don't have one
// and insert the public key here.
// It should also be loaded from an environment variable.
// =====================================================================================
// FIX: Add non-null assertion to VAPID_KEY for consistent type handling.
export const VAPID_KEY = process.env.FIREBASE_VAPID_KEY!;
