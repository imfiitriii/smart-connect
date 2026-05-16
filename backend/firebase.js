const dotenv = require('dotenv');
dotenv.config();

const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

// paste from Firebase console
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "ai-relationship-management.firebaseapp.com",
    projectId: "ai-relationship-management",
    storageBucket: "ai-relationship-management.firebasestorage.app",
    messagingSenderId: "1088540993683",
    appId: "1:1088540993683:web:742066d164941b475d4566",
    measurementId: "G-KMSPYKRDNG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

module.exports = { db };