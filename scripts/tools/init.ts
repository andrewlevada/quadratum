import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { Firestore, getFirestore } from "@firebase/firestore";

export function connectFirestore(): Firestore {
    const firebaseConfig = {
        apiKey: "AIzaSyBWWzh0RAtr8Um-b0dHk5M-YZvhmrvlZKI",
        authDomain: "quadratum-app.firebaseapp.com",
        projectId: "quadratum-app",
        storageBucket: "quadratum-app.appspot.com",
        messagingSenderId: "245501526235",
        appId: "1:245501526235:web:57c17dc55932cdaebe4cfe",
    };

    const app = initializeApp(firebaseConfig);
    getAuth(app);
    return getFirestore(app);
}
