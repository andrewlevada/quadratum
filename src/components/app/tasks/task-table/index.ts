import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, state } from "lit/decorators.js";
import Task from "~src/models/task";
import { getCurrentSprintNumber } from "~src/models/legacy/sprint/data";
import { ActionOrigin, createTask } from "~src/models/task/factory";
import Project from "~src/models/legacy/project";
import scopedStyles from "./styles.lit.scss";
import "@material/mwc-icon-button";
import Scope from "~src/models/scope";

import("~components/legacy/color-chip").then(f => f.default());
import("~components/common/square-checkbox").then(f => f.default());
import("~components/common/inline-text-input").then(f => f.default());

export default (): void => defineComponent("task-table", TaskTable);
export class TaskTable extends LitElement {
    @property({ type: Array }) tasks!: Task[];
    @property({ type: Object }) scope!: Scope;

    render(): TemplateResult {
        return html`
            <div class="container">
                <div class="header">
                    <h6 class="header-name">Tasks</h6>
                    <h6 class="header-milestones">Milestones</h6>
                    <h6 class="header-due">Due dates</h6>
                </div>

                ${TaskTable.reorderTasks(this.tasks).map(task => html`
                    <div class="text flex row align-center ${task.parentTaskId ? "sub" : ""}">
                        <inline-text-input value=${task.text}
                                           class=${task.modifier(this.tasks).isCompletedTree() ? "fade" : ""}
                                           @update=${(event: CustomEvent) => {
                                               task.text = (event.detail.value as string).trim();
                                           }} @clear=${() => {
                            task.modifier(this.tasks).deleteTree();
                        }}></inline-text-input>
                    </div>

                    <sessions-adjuster .value=${task.sessions} @change=${(e: CustomEvent) => {
                        task.sessions = e.detail.value;
                    }}></sessions-adjuster>
                    
                    
                `)}
            </div>
        `;
    }

    private static reorderTasks(heap: Task[]): Task[] {
        const tasks: Task[] = [];

        for (const t of heap.filter(v => !v.isCompleted && !v.isInDaily)) {
            if (t.parentTaskId) continue;
            tasks.push(t, ...this.constructSubTree(heap, t.id));
        }

        for (const t of heap.filter(v => !v.isCompleted && v.isInDaily)) {
            if (t.parentTaskId) continue;
            tasks.push(t, ...this.constructSubTree(heap, t.id));
        }

        for (const t of heap.filter(v => v.isCompleted)) {
            if (t.parentTaskId) continue;
            tasks.push(t, ...this.constructSubTree(heap, t.id));
        }

        return tasks;
    }

    private static constructSubTree(heap: Task[], parentId: string): Task[] {
        const tasks: Task[] = [];

        for (const t of heap)
            if (t.parentTaskId === parentId)
                tasks.push(t, ...this.constructSubTree(heap, t.id));

        return tasks;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
