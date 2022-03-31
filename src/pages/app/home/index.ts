import { CSSResultGroup, html, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { AppPageElement } from "~components/app/router/app-router";
import scopedStyles from "./styles.lit.scss";

import("~components/app/tasks/tasks-card").then(f => f.default());
import("~components/app/tasks/task-item").then(f => f.default());
import("~components/common/card-surface").then(f => f.default());

@customElement("app-page--home")
export default class AppPageHome extends AppPageElement {
    render(): TemplateResult {
        return html`
            <div class="flex col gap app-page full-width">
                <h4>Your home</h4>
                
                <card-surface id="active-task-card" type="outlined">
                    <p>Task</p>
                </card-surface>
                
                <div class="wrapper">
                    <div class="flex col gap">
                        <h6>Up next</h6>
                        <tasks-card .tasks=${[]}></tasks-card>
                        
                        <h6>Feel like doing something different?</h6>
                        <tasks-card .tasks=${[]}></tasks-card>
                    </div>

                    <div class="flex col gap">
                        <h6>Completed today</h6>
                        <tasks-card .tasks=${[]}></tasks-card>

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
