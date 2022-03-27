import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "~src/global";

import("~components/app/side-bar").then(f => f.default());
import("~components/app/router/app-router").then(f => f.default());

@customElement("app-page")
export default class AppPage extends LitElement {
    render(): TemplateResult {
        return html`
            <side-bar>
                <app-router></app-router>
            </side-bar>
        `;
    }

    static get styles(): CSSResultGroup {
        // Styles can either be in this file (only css)
        // or imported from another file (scss in this case)
        return [...pageStyles, css`
          // More styles here
        `];
    }
}
