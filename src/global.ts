import globalStyles from "~styles/global.scss";
import globalPageStyles from "~src/pages/global-styles.scss";
import layoutHelperStyles from "~styles/tiny-layout-helper.scss";
import { initializeApp } from "@firebase/app";
import { getAnalytics, setUserId, setUserProperties } from "@firebase/analytics";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { BrowserTracing } from "@sentry/tracing";
import { init } from "@sentry/browser";
import "~utils/prototypes";

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

    if (PRODUCTION) {
        // eslint-disable-next-line no-console
        console.log("Running in production env!");

        init({
            dsn: "https://4a0d7f67595d4d7c8eca0ad7add1fef9@o570491.ingest.sentry.io/6256806",
            integrations: [new BrowserTracing()],
            tracesSampleRate: 0.8,
        });

        const analytics = getAnalytics(app);
        onAuthStateChanged(getAuth(app), user => {
            if (user) {
                setUserId(analytics, user.uid);
                setUserProperties(analytics, { crmId: user.uid });
            }
        });
    }
}
