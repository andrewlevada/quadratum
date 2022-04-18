import { css, html, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import Task from "~src/models/task";
import "@material/mwc-button";
import "@material/mwc-dialog";
import "@material/mwc-textfield";
import "@material/mwc-icon-button";
import { AppPageElement } from "~components/app/router/app-router";
import Scope from "~src/models/scope";
import { listenForCompletedTasksFromScope, listenForPendingTasksFromScope } from "~src/models/task/factory";

import("~components/common/card-surface").then(f => f.default());
import("~components/app/tasks/task-table").then(f => f.default());

@customElement("app-page--scope")
export default class AppPageScope extends AppPageElement {
    @state() scope: Scope | null = null;
    @state() pendingTasks: Task[] = [];

    @state() completedTasks: Task[] = [];
    @state() showCompleted: boolean = false;

    render(): TemplateResult {
        return html`
            <div class="flex col app-page gap big-gap">
                <div class="flex row justify-between align-center full-width">
                    <div class="flex row gap align-center">
                        <span id="scope-icon" class="material-icons">${this.scope?.symbol || "star"}</span>
                        <h4>${this.scope?.label || ""} ${this.scope?.isArchived ? "(Archived)" : ""}</h4>
                    </div>
                </div>

                <h6>To be completed</h6>

                <card-surface type="filled">
                    ${this.scope ? html`
                        <task-table .tasks=${this.pendingTasks} .scope=${this.scope}></task-table>
                    ` : ""}
                </card-surface>

                <h6>Completed</h6>

                <card-surface type="filled"
                              class=${this.showCompleted ? "clickable" : ""}
                              @click=${() => {
                                  if (!this.showCompleted) this.showCompleted = true;
                              }}>
                    ${this.showCompleted && this.scope ? html`
                        <task-table .tasks=${this.completedTasks} .scope=${this.scope}></task-table>
                    ` : html`
                        <h6>Show tasks</h6>
                    `}
                </card-surface>
            </div>
        `;
    }

    requestReload() {
        super.requestReload();
        const id = window.location.pathname.split("/").pop();
        if (!id) return;

        for (const unsubscribe of this.dataListeners) unsubscribe();
        this.dataListeners = [];
        this.showCompleted = false;

        this.dataListeners.push(Scope.listen(id, scope => {
            this.scope = scope;
        }));

        this.dataListeners.push(listenForPendingTasksFromScope(id, tasks => {
            this.pendingTasks = tasks;
        }));
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (this.scope && this.showCompleted && this.dataListeners.length === 2) {
            this.dataListeners.push(listenForCompletedTasksFromScope(this.scope.id, tasks => {
                this.completedTasks = tasks;
            }));
        }
    }

    static styles = [...pageStyles, css`
      #scope-icon {
        font-size: 24px;
      }
    `];
}
