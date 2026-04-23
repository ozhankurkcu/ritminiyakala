const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');
const { getFirestore } = require('firebase/firestore');
const { getStorage } = require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyBRLaEkmAn2kvuQjBfXoofsJNCu_SpLtEk",
  authDomain: "ritminiyakala.firebaseapp.com",
  projectId: "ritminiyakala",
  storageBucket: "ritminiyakala.firebasestorage.app",
  messagingSenderId: "261276810395",
  appId: "1:261276810395:web:3ddb9cca05a94ddc95a3e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

module.exports = { app, auth, db, storage };