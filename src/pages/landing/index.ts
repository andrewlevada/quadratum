import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { getAuth } from "@firebase/auth";
import { AppPageElement } from "~components/app-container/router/app-router";
import scopedStyles from "./styles.lit.scss";

@customElement("app-page--landing")
export default class LandingPage extends AppPageElement {
    render(): TemplateResult {
        return html`
            <div class="container">
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        getAuth().onAuthStateChanged(() => {
            if (getAuth().currentUser) {
                window.location.pathname = "/app";
            }
        });
    }

    static styles = [...pageStyles, scopedStyles];
}
