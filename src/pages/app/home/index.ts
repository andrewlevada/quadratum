import { CSSResultGroup, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import "@material/mwc-button";
import { AppPageElement } from "~components/app/router/app-router";
import scopedStyles from "./styles.lit.scss";

@customElement("app-page--home")
export default class AppPageHome extends AppPageElement {
    render(): TemplateResult {
        return html`
            <div class="flex col app-page full-width">
                <h4>Your home</h4>
                <div class="wrapper">
                    <div class="flex col">
                        <h6>Up next</h6>
                        <h6>Feel like doing something different?</h6>
                    </div>

                    <div class="flex col">
                        <h6>Completed today</h6>
                        <h6>Stay on track</h6>
                    </div>
                </div>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...pageStyles, scopedStyles];
    }
}
