import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { AppPageElement } from "~components/app/router/app-router";

@customElement("app-page--not-found")
export default class AppPageNotFound extends AppPageElement {
    render(): TemplateResult {
        return html`
            <h4>404 - Not found</h4>
        `;
    }

    static styles = [...pageStyles];
}
