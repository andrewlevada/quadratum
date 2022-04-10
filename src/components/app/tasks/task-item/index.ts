import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, query } from "lit/decorators.js";
import Task from "~src/models/task";
import { timestampToRelativeString } from "~utils/time";
import { Menu } from "@material/mwc-menu";
import { TaskContextModifier } from "~src/models/task/task-context-modifier";
import { taskItemActionsHtml, taskItemActionsStyles } from "~components/app/tasks/task-item/actions";

import("~components/common/menu-tiny-button").then(f => f.default());
import("~components/common/square-checkbox").then(f => f.default());

export type TaskItemDisplay = "pending" | "active" | "completed";

export default (): void => defineComponent("task-item", TaskItem);
export class TaskItem extends LitElement {
    @property({ type: Object }) task!: Task;
    @property({ type: String }) displayType!: TaskItemDisplay;
    @property({ type: Object }) taskModifier: TaskContextModifier | null = null;

    @query("#actions-menu") actionsMenu!: Menu;
    @query("#actions-button") actionsButton!: HTMLElement;

    render(): TemplateResult {
        return html`
            <div class="flex row justify-between">
                <div class="flex row grow">
                    ${this.displayType === "pending" ? html`
                        <square-checkbox .label=${this.getPendingCheckboxValue()}
                                         class="pending-checkbox"
                                         @click=${() => {
                                             Task.setActive(this.task).then();
                                         }}></square-checkbox>
                    ` : ""}

                    <div class="flex col grow">
                        <div class="flex row justify-between full-width">
                            <p class="text">${this.task.text}</p>
                            <menu-tiny-button icon="more_horiz">
                                ${taskItemActionsHtml(this)}
                            </menu-tiny-button>
                        </div>

                        <div class="flex row justify-between sub">
                            <p class="scope">${this.task.scope.location}</p>
                            ${this.displayType !== "completed" ? html`
                                <div class="flex row gap">${this.infoBadge()}</div>
                            ` : ""}
                        </div>
                    </div>
                </div>

                ${this.displayType !== "pending" && this.task.progress ? html`
                    <div class="flex row gap progress-checkboxes">
                        ${this.task.progress.map((v, i) => html`
                            <square-checkbox ?checked=${v}
                                             @change=${(event: CustomEvent) => {
                                                 const newProgress = this.task.progress!;
                                                 newProgress[i] = event.detail.value as boolean;
                                                 this.task.progress = newProgress;
                                                 this.dispatchSimpleEvent("taskChange");
                                             }}></square-checkbox>
                        `)}
                    </div>
                ` : ""}
            </div>
        `;
    }

    private infoBadge(): TemplateResult {
        if (this.task.dueDate) return html`
            <p>${timestampToRelativeString(this.task.dueDate)}</p>
            <span class="material-icons">schedule</span>
        `;

        if (this.task.wasActive) return html`
            <p>Not finished</p>
            <span class="material-icons">pause_circle</span>
        `;

        return html``;
    }

    private getPendingCheckboxValue(): string {
        if (this.task.sessions <= 1) return "";
        return this.task.sessions.toString();
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, taskItemActionsStyles, css`
          .pending-checkbox {
            margin-right: 12px;
          }

          .progress-checkboxes {
            margin-left: 12px;
          }

          .text {
            font-weight: 500;
            font-size: 16px;
            line-height: 18px;
          }

          .sub *:not(.material-icons) {
            font-size: 14px;
            line-height: 20px;
          }

          .material-icons {
            font-size: 18px;
          }
        `];
    }
}
