import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import Task from "~services/task";

import("~components/app/task-table").then(f => f.default());

@customElement("app-page--daily")
export default class AppPageDailyList extends LitElement {
    @state() dailyTasks: Task[] | null = null;

    render(): TemplateResult {
        return html`
            <div class="flex col app-page">
                <h4>Daily List</h4>
                ${this.dailyTasks ? html`
                    <task-table .tasks=${this.dailyTasks} origin="daily"></task-table>
                ` : ""}
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        Task.daily().then(tasks => {
            this.dailyTasks = tasks;
        });
    }

    static get styles(): CSSResultGroup {
        return [...pageStyles, css``];
    }
}
