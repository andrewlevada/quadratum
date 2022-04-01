import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property } from "lit/decorators.js";
import Task from "~src/models/task";
import { TaskItemDisplay } from "~components/app/tasks/task-item";

import("~components/common/card-surface").then(f => f.default());
import("~components/app/tasks/task-item").then(f => f.default());

export default (): void => defineComponent("tasks-card", TasksCard);
export class TasksCard extends LitElement {
    @property({ type: Array }) tasks!: Task[];
    @property({ type: String }) displayType!: TaskItemDisplay;

    render(): TemplateResult {
        return html`
            <card-surface type="filled">
                ${this.tasks.map(task => html`
                    <task-item .task=${task} .displayType=${this.displayType}></task-item>
                `)}
                
                ${this.tasks.length === 0 ? html`
                    <p>No tasks to display</p>
                ` : ""}
            </card-surface>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          :host {
            height: fit-content;
          }
          
          card-surface {
            width: 100%;
          }
        `];
    }
}
