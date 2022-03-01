import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { getUsername } from "~services/name-service";
import scopedStyles from "./styles.module.scss";

import("~components/app/side-bar").then(f => f.default());

@customElement("app-page")
export default class AppPage extends LitElement {
    @state() username: string | null = null;

    render(): TemplateResult {
        return html`
            <side-bar>
                <div id="section">
                    <h4>Section Title</h4>
                </div>
            </side-bar>
        `;
    }

    connectedCallback(): void {
        super.connectedCallback();
        this.username = getUsername();
        // eslint-disable-next-line no-console
        if (!PRODUCTION) console.log("Everything is working!");
    }

    static get styles(): CSSResultGroup {
        // Styles can either be in this file (only css)
        // or imported from another file (scss in this case)
        return [...pageStyles, scopedStyles as never, css`
          // More styles here
        `];
    }
}
