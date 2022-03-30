import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import Sprint from "~src/models/sprint";
import Task from "~src/models/task";
import { getCurrentSprintNumber } from "~src/models/sprint/data";
import { AppPageElement } from "~components/app/router/app-router";

import("~components/app/task-table").then(f => f.default());

@customElement("app-page--sprint")
export default class AppPageSprintList extends AppPageElement {
    @state() sprint: Sprint | null = null;
    @state() tasks: Task[] | null = null;
    @state() isCurrentSprint: boolean = false;
    @state() hideDoneTasks: boolean = false;

    render(): TemplateResult {
        return html`
            <div class="flex col app-page">
                <div class="flex row justify-between align-center">
                    <h4>${this.pageHeader()}</h4>
                    <mwc-button label="${this.hideDoneTasks ? "Show" : "Hide"} done" outlined
                                icon=${this.hideDoneTasks ? "visibility" : "visibility_off"} @click=${() => {
                        this.hideDoneTasks = !this.hideDoneTasks;
                    }}></mwc-button>
                </div>

                ${this.sprint ? html`
                    <task-table .tasks=${this.hideDoneTasks ? this.tasks!.filter(v => !v.isCompleted) : this.tasks}
                                origin="sprint" .isCurrentSprint=${this.isCurrentSprint}
                                globalSprintNumber=${this.sprint.number}></task-table>
                ` : ""}
            </div>
        `;
    }

    requestReload() {
        super.requestReload();
        const path = window.location.pathname.split("/");
        if (path.length !== 4 || path[2] !== "sprint") return;
        const sprintNumber = Number(path.last());
        Promise.all([Sprint.fromNumber(sprintNumber), Sprint.tasks(sprintNumber), getCurrentSprintNumber()])
            .then(([sprint, tasks, currentSprintNumber]) => {
                this.sprint = sprint;
                this.tasks = tasks;
                this.isCurrentSprint = currentSprintNumber === sprintNumber;
            }).catch();
    }

    private pageHeader(): string {
        if (this.sprint?.number === 0) return "Your First Sprint!";
        return `Sprint ${this.sprint?.number || ""}`;
    }

    static get styles(): CSSResultGroup {
        return [...pageStyles, css``];
    }
}
