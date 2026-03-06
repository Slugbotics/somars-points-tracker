// ─── SOMARS Points Tracker · firebase-config.js ──────────────────────────────
// 🔧 PASTE YOUR FIREBASE CONFIG HERE (from Firebase Console → Project Settings)

const firebaseConfig = {
  apiKey:            "AIzaSyBMDEEKkuJxQBOrfGUIZxQekmzQr0soML0",
  authDomain:        "somars-points-tracker.firebaseapp.com",
  projectId:         "somars-points-tracker",
  storageBucket:     "somars-points-tracker.firebasestorage.app",
  messagingSenderId: "639158617385",
  appId:             "1:639158617385:web:ccd0fc0fad3ec947f12338",
};

// Initialize Firebase app, Firestore, and Auth
firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
const auth = firebase.auth();
