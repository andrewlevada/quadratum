import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import Task from "~services/task";
import "@material/mwc-button";
import { AppPageElement } from "~components/app/router/app-router";

import("~components/app/task-table").then(f => f.default());

@customElement("app-page--daily")
export default class AppPageDailyList extends AppPageElement {
    @state() dailyTasks: Task[] | null = null;
    @state() hasDoneTasks: boolean = false;

    render(): TemplateResult {
        return html`
            <div class="flex col app-page">
                <div class="flex row justify-between align-center">
                    <h4>Daily List</h4>
                    ${this.hasDoneTasks ? html`
                        <mwc-button label="Remove done" icon="grading" outlined @click=${() => {
                            this.dailyTasks!.filter(v => v.isDone()).forEach(v => {
                                v.isInDaily = false;
                            });

                            this.dailyTasks = this.dailyTasks!.filter(v => !v.isDone());
                            this.hasDoneTasks = false;
                            this.requestUpdate();
                        }}></mwc-button>
                    ` : ""}
                </div>
                
                ${this.dailyTasks ? html`
                    <task-table .tasks=${this.dailyTasks} origin="daily"></task-table>
                ` : ""}
            </div>
        `;
    }

    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
    requestReload(): void { }

    connectedCallback() {
        super.connectedCallback();
        Task.daily().then(tasks => {
            this.dailyTasks = tasks;
            this.hasDoneTasks = this.dailyTasks.some(v => v.isDone());
        });
    }

    static get styles(): CSSResultGroup {
        return [...pageStyles, css``];
    }
}
