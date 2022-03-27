import { css, CSSResultGroup, html, LitElement, TemplateResult, unsafeCSS } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { getAuth } from "@firebase/auth";
import scopedStyles from "./styles.module.scss";

@customElement("landing-page")
export default class LandingPage extends LitElement {
    render(): TemplateResult {
        return html`
            <div class="container">
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        getAuth().onAuthStateChanged(() => {
            if (getAuth().currentUser) window.location.pathname = "/app/daily";
        });
    }

    static get styles(): CSSResultGroup {
        // Styles can either be in this file (only css)
        // or imported from another file (scss in this case)
        return [...pageStyles, unsafeCSS(scopedStyles), css`
          // More styles here
        `];
    }
}
