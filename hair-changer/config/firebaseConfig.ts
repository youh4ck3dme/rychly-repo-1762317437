// config/firebaseConfig.ts

// These are your actual Firebase project configuration values.
export const firebaseConfig = {
  apiKey: "AIzaSyB9XP28a-BT-rP-tCyYZJSz64gxjr82iEo",
  authDomain: "hairchainger-main-876665-176e8.firebaseapp.com",
  projectId: "hairchainger-main-876665-176e8",
  storageBucket: "hairchainger-main-876665-176e8.appspot.com",
  messagingSenderId: "1058200372429",
  appId: "1:1058200372429:web:282ddae973418945705584",
  measurementId: "G-WKF7CKN6MN"
};

// =====================================================================================
// !!! DÔLEŽITÉ UPOZORNENIE / IMPORTANT NOTICE !!!
// =====================================================================================
// TOTO JE VÁŠ VAPID KĽÚČ Z PROJEKTOVÝCH NASTAVENÍ FIREBASE -> Cloud Messaging -> Web Push certifikáty.
// Bez neho NEBUDÚ fungovať push notifikácie. Ak ho nemáte, vygenerujte si nový pár kľúčov
// a vložte verejný kľúč (public key) sem.
//
// This is your VAPID key from Firebase project settings -> Cloud Messaging -> Web Push certificates.
// Without it, push notifications WILL NOT WORK. Generate a new key pair if you don't have one
// and insert the public key here.
// =====================================================================================
export const VAPID_KEY = "BHP3kLvC_t94VvsRHrFhqjI5C6PRJtpfe_IYDv_7VmEWyjXVZXAEtCC8kNN_j4oMyecUFzQazcyhVigIiPcqUb8";