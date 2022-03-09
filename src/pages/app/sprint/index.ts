import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import Sprint from "~services/sprint";
import Task from "~services/task";
import { getCurrentSprintNumber } from "~services/sprint/data";

import("~components/app/task-table").then(f => f.default());

@customElement("app-page--sprint")
export default class AppPageSprintList extends LitElement {
    @state() sprint: Sprint | null = null;
    @state() tasks: Task[] | null = null;
    @state() isCurrentSprint: boolean = false;

    render(): TemplateResult {
        return html`
            <div class="flex col app-page">
                <h4>${this.pageHeader()}</h4>
                ${this.sprint ? html`
                    <task-table .tasks=${this.tasks} origin="sprint" .isCurrentSprint=${this.isCurrentSprint}
                                globalSprintNumber=${this.sprint.number}></task-table>
                ` : ""}
            </div>
        `;
    }

    private pageHeader(): string {
        if (this.sprint?.number === 0) return "Your First Sprint!";
        return `Sprint ${this.sprint?.number || ""}`;
    }

    connectedCallback() {
        super.connectedCallback();
        const sprintNumber = Number(window.location.pathname.split("/").last());

        Promise.all([Sprint.fromNumber(sprintNumber), Sprint.tasks(sprintNumber), getCurrentSprintNumber()])
            .then(([sprint, tasks, currentSprintNumber]) => {
                this.sprint = sprint;
                this.tasks = tasks;
                this.isCurrentSprint = currentSprintNumber === sprintNumber;
            });
    }

    static get styles(): CSSResultGroup {
        return [...pageStyles, css``];
    }
}
