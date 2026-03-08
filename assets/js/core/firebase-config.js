// assets/js/core/firebase-config.js
// إعدادات Firebase الأساسية - آمنة ومشفرة

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    child, 
    onValue, 
    push, 
    update, 
    remove,
    query,
    orderByChild,
    equalTo,
    limitToLast,
    startAt,
    endAt
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

import { 
    getStorage, 
    ref as storageRef, 
    uploadBytes, 
    getDownloadURL,
    deleteObject,
    listAll
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCaPhRG_1c7Rsu5Ss_MUNqsE18Ky_nyEAA",
    authDomain: "itws-system.firebaseapp.com",
    databaseURL: "https://itws-system-default-rtdb.firebaseio.com",
    projectId: "itws-system",
    storageBucket: "itws-system.firebasestorage.app",
    messagingSenderId: "770452248691",
    appId: "1:770452248691:web:0e94e65e01298b398bb206"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);

// دوال مساعدة للتحقق من الأمان
const securityCheck = {
    // التحقق من صلاحية المستخدم
    hasPermission: (userRole, requiredLevel) => {
        const permissionLevels = {
            'guest': 0,
            'member': 50,
            'committee_head': 60,
            'branch_manager': 70,
            'vice_president': 90,
            'president': 100
        };
        return (permissionLevels[userRole] || 0) >= requiredLevel;
    },

    // تشفير بسيط للبيانات (للتوسع مستقبلاً)
    encrypt: (data) => {
        return btoa(encodeURIComponent(data));
    },

    // فك تشفير
    decrypt: (encrypted) => {
        return decodeURIComponent(atob(encrypted));
    }
};

// تصدير كل الوظائف والمتغيرات
export { 
    app,
    database, 
    storage,
    auth,
    ref,
    set,
    get,
    child,
    onValue,
    push,
    update,
    remove,
    query,
    orderByChild,
    equalTo,
    limitToLast,
    startAt,
    endAt,
    storageRef,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    listAll,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    securityCheck
};

// تصدير افتراضي للاستخدام السهل
export default {
    app,
    database,
    storage,
    auth,
    securityCheck
};
