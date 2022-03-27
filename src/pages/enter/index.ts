import { css, CSSResultGroup, html, LitElement, TemplateResult, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import googleIcon from "~src/assets/icons/logo_google.svg";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "@firebase/auth";
import { initializeUser } from "~services/user-service";
import backgroundImage from "~src/assets/images/enter-bg.png";
import logoImage from "~src/assets/icons/logo.svg";
import scopedStyles from "./styles.module.scss";
import "@material/mwc-fab";

@customElement("enter-page")
export default class EnterPage extends LitElement {
    render(): TemplateResult {
        return html`
            <div class="flex row justify-end align-center full-width full-height wrapper">
                <div class="flex col gap big-gap inner">
                    <h2>Quadratum</h2>
                    <h3>Task tracker — simple</h3>
                    <h3>aesthetic</h3>
                    <h3>assisting</h3>
                    <mwc-fab extended label="Sign in with Google" @click=${EnterPage.googleSignIn}>
                        <img slot="icon" src=${googleIcon} alt="Google logo">
                    </mwc-fab>
                </div>
            </div>
            <img alt="null" src=${logoImage} id="logo">
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
        return [...pageStyles, unsafeCSS(scopedStyles), css`
          #logo {
            position: absolute;
            left: 80px;
            top: 80px;
            width: 120px;
            height: 120px;
          }
          
          h2, h3 {
            color: var(--mdc-theme-on-primary);
          }
          
          mwc-fab {
            --mdc-theme-secondary: white;
            --mdc-theme-on-secondary: black;
            margin-top: 40px;
          }
          
          .wrapper {
            background-image: url(${unsafeCSS(backgroundImage)});
            background-size: cover;
            background-position: right;
            padding: 80px;
          }
          
          .inner {
            align-items: end;
          }
          
          h2 {
            margin-bottom: 60px !important;
          }
        `];
    }
}
