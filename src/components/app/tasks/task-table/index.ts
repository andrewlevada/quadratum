import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property } from "lit/decorators.js";
import Task from "~src/models/task";
import scopedStyles from "./styles.lit.scss";
import Scope from "~src/models/scope";
import { createTask, CreationContext } from "~src/models/task/factory";

import("~components/common/inline-text-input").then(f => f.default());
import("./due-cell").then(f => f.default());
import("./sessions-adjuster").then(f => f.default());
import("./add-button").then(f => f.default());

export default (): void => defineComponent("task-table", TaskTable);
export class TaskTable extends LitElement {
    @property({ type: Array }) tasks!: Task[];
    @property({ type: Object }) scope!: Scope;

    render(): TemplateResult {
        return html`
            <div class="container">
                <h6 class="header-name">Tasks</h6>
                <h6 class="header-milestones">Milestones</h6>
                <h6 class="header-due">Due dates</h6>

                ${TaskTable.reorderTasks(this.tasks).map(task => html`
                    <div class="text flex row align-center ${task.parentTaskId ? "sub" : ""}">
                        <inline-text-input value=${task.text}
                                           class=${task.modifier(this.tasks).isCompletedTree() ? "fade" : ""}
                                           @update=${(event: CustomEvent) => {
                                               task.text = (event.detail.value as string).trim();
                                           }} @clear=${() => {
                            task.modifier(this.tasks).deleteTree();
                        }}></inline-text-input>

                        ${!task.parentTaskId ? html`
                            <add-button sub @create=${(event: CustomEvent) => {
                                createTask(event.detail.value, {
                                    parentTask: task,
                                    scope: {
                                        id: task.scope.id,
                                    }
                                } as CreationContext).then();
                            }}></add-button>
                        ` : ""}
                    </div>

                    <sessions-adjuster .task=${task}></sessions-adjuster>
                    
                    <task-table--due-cell class="due" .task=${task}></task-table--due-cell>
                `)}
            </div>
        `;
    }

    private static reorderTasks(heap: Task[]): Task[] {
        const tasks: Task[] = [];

        for (const t of heap.filter(v => !v.isCompleted)) {
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
