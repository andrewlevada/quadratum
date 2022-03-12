import globalStyles from "~styles/global.scss";
import globalPageStyles from "~src/pages/global-styles.scss";
import layoutHelperStyles from "~styles/tiny-layout-helper.scss";
import { initializeApp } from "@firebase/app";
import { getAnalytics } from "@firebase/analytics";
import "~utils/prototypes";
import { getAuth } from "@firebase/auth";

export const componentStyles = [globalStyles, layoutHelperStyles];
export const pageStyles = [globalStyles, globalPageStyles, layoutHelperStyles];

initEnv();
function initEnv(): void {
    const firebaseConfig = {
        apiKey: "AIzaSyBWWzh0RAtr8Um-b0dHk5M-YZvhmrvlZKI",
        authDomain: "quadratum-app.firebaseapp.com",
        projectId: "quadratum-app",
        storageBucket: "quadratum-app.appspot.com",
        messagingSenderId: "245501526235",
        appId: "1:245501526235:web:57c17dc55932cdaebe4cfe",
        measurementId: "G-66V8TPLHHX",
    };

    const app = initializeApp(firebaseConfig);
    getAuth(app);
    if (PRODUCTION) getAnalytics(app);
}
