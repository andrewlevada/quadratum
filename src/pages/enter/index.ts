import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import googleIcon from "~src/assets/icons/logo_google.svg";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "@firebase/auth";
import { initializeUser } from "~services/user-service";
import scopedStyles from "./styles.module.scss";
import "@material/mwc-fab";

@customElement("enter-page")
export default class EnterPage extends LitElement {
    render(): TemplateResult {
        return html`
            <div class="flex row justify-center align-center full-width full-height">
                <div class="flex col gap big-gap align-center">
                    <h3>Welcome to Quadratum - just good task tracker</h3>
                    <mwc-fab extended label="Sign in with Google" @click=${EnterPage.googleSignIn}>
                        <img slot="icon" src=${googleIcon} alt="Google logo">
                    </mwc-fab>
                </div>
            </div>
        `;
    }

    private static googleSignIn(): void {
        const auth = getAuth();
        signInWithPopup(auth, new GoogleAuthProvider())
            .then(credentials => initializeUser(credentials.user.uid))
            .then(() => {
                window.location.pathname = "/app";
            })
            // eslint-disable-next-line no-console
            .catch(() => console.log("Auth failed"));
    }

    static get styles(): CSSResultGroup {
        // Styles can either be in this file (only css)
        // or imported from another file (scss in this case)
        return [...pageStyles, scopedStyles as never, css`
          mwc-fab {
            --mdc-theme-secondary: white;
            --mdc-theme-on-secondary: black;
          }
        `];
    }
}
