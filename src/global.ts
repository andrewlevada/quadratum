import globalStyles from "~styles/global.scss";
import globalPageStyles from "~src/pages/global-styles.scss";
import layoutHelperStyles from "~styles/tiny-layout-helper.scss";
import { initializeApp } from "@firebase/app";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { BrowserTracing } from "@sentry/tracing";
import { init, setUser } from "@sentry/browser";
import "~utils/prototypes";
import { css, unsafeCSS } from "lit";
import gropledFont from "./assets/fonts/Gropled-Bold.otf";

export const componentStyles = [unsafeCSS(globalStyles), unsafeCSS(layoutHelperStyles), css`
  @font-face {
    font-family: "Gropled";
    src: url(${unsafeCSS(gropledFont)}) format("otf");
  }
`];

export const pageStyles = [...componentStyles, unsafeCSS(globalPageStyles)];

initEnv();
function initEnv(): void {
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

    if (PRODUCTION) {
        // eslint-disable-next-line no-console
        console.log("Running in production env!");

        init({
            dsn: "https://4a0d7f67595d4d7c8eca0ad7add1fef9@o570491.ingest.sentry.io/6256806",
            integrations: [new BrowserTracing()],
            tracesSampleRate: 0.8,
            beforeSend: (event, hint) => {
                const error = hint?.originalException;
                if (error && typeof error === "object" && error.message?.endsWith("[Sentry ignore]"))
                    return null;
                return event;
            },
        });

        onAuthStateChanged(getAuth(app), user => {
            if (user) {
                window.gtag("js", new Date());
                window.gtag("config", "G-66V8TPLHHX", { user_id: user.uid });
                window.gtag("set", "user_properties", { crm_id: user.uid });
                setUser({ id: user.uid });
            }
        });
    }
}
