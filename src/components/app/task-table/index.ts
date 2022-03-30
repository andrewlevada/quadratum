/* eslint-disable indent */
import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, state } from "lit/decorators.js";
import Task from "~src/models/task";
import { getCurrentSprintNumber } from "~src/models/sprint/data";
import { ActionOrigin, createTask } from "~src/models/task/factory";
import Project from "~src/models/project";
import scopedStyles from "./styles.lit.scss";
import "@material/mwc-icon-button";

import("~components/common/color-chip").then(f => f.default());
import("~components/common/square-checkbox").then(f => f.default());
import("./inline-text-input").then(f => f.default());
import("./add-button").then(f => f.default());
import("./progress-line").then(f => f.default());

export interface Section {
    project: Project | null;
    tasks: Task[];
}

export default (): void => defineComponent("task-table", TaskTable);
export class TaskTable extends LitElement {
    @property({ type: Array }) tasks!: Task[];
    @property({ type: String }) origin!: ActionOrigin;
    @property({ type: Number }) globalSprintNumber?: number;
    @property({ type: String }) globalProjectId?: string;
    @state() sections: Section[] | null = null;
    @state() currentSprintDelta: number | null = null;

    render(): TemplateResult {
        return this.canRender() ? html`
            <div class="container">
                ${this.sections!.map(section => (section.tasks.length > 0 ? html`
                    ${section.tasks.map((task, i) => html`
                        ${i === 0 && !this.globalProjectId ? html`
                            <color-chip class="project" .color=${section.project?.color || "#dedede"}>
                                ${section.project?.label || "None"}
                            </color-chip>
                        ` : ""}

                        <div class="text flex row align-center ${task.parentTaskId ? "sub" : ""} ${TaskTable.isLastChild(section, i) ? "gap" : ""}">
                            <inline-text-input value=${task.text}
                                               class=${task.modifier(this.tasks).isCompletedTree() ? "fade" : ""}
                                               @update=${(event: CustomEvent) => {
                                                   task.text = (event.detail.value as string).trim();
                                               }} @clear=${() => {
                                task.modifier(this.tasks).deleteTree();
                                this.requestUpdate();
                            }}></inline-text-input>

                            <add-button sub @create=${(event: CustomEvent) => {
                                this.createTask(event.detail.value, section, task.parentTaskId || task.id)
                                        .then(t => {
                                            this.tasks.push(t);
                                            this.requestUpdate("tasks");
                                        });
                            }}></add-button>
                        </div>

                        <progress-line class="progress" .section=${section} .contextTasks=${this.tasks}
                                       .task=${task} .taskIndex=${i} .currentSprintDelta=${this.currentSprintDelta}
                                       .origin=${this.origin} @requestReorder=${() => this.requestUpdate("tasks")}
                                       @taskChange=${() => this.requestUpdate()}></progress-line>
                    `)}

                    <add-button @create=${(event: CustomEvent) => {
                        this.createTask(event.detail.value, section).then(task => {
                            this.tasks.push(task);
                            this.requestUpdate("tasks");
                        });
                    }}></add-button>
                ` : ""))}

                ${this.isEmptyState() ? html`
                    <add-button nohide @create=${(event: CustomEvent) => {
                        this.createTask(event.detail.value, null).then(task => {
                            this.tasks = [task];
                        });
                    }}></add-button>
                ` : ""}
            </div>
        ` : html``;
    }

    private canRender(): boolean {
        return !!this.sections && (this.globalSprintNumber === undefined || this.currentSprintDelta !== null);
    }

    private isEmptyState(): boolean {
        return this.sections!.length === 0 || this.sections!.every(v => v.tasks.length === 0);
    }

    protected update(changedProperties: PropertyValues) {
        super.update(changedProperties);
        if (!this.tasks) throw new Error("tasks-table requires property tasks, but it's not set");
        if (!changedProperties.has("tasks")) return;

        if (this.globalSprintNumber !== undefined)
            getCurrentSprintNumber().then(value => {
                this.currentSprintDelta = this.globalSprintNumber! - value;
            });

        const temp: Record<string, Task[]> = { none: [] };
        for (const task of this.tasks) {
            const pId = task.projectId || "none";
            if (!temp[pId]) temp[pId] = [];
            temp[pId].push(task);
        }

        for (const i of Object.entries(temp))
            temp[i[0]] = TaskTable.reorderTasks(i[1]);

        const fetchProjects = Object.keys(temp);
        fetchProjects.shift();
        Project.fromIds(fetchProjects).then(projects => {
            projects.sort((a: Project, b: Project) => a.label.localeCompare(b.label));
            this.sections = [];
            for (const project of projects) this.sections.push({
                project, tasks: temp[project.id],
            });

            if (temp.none.length > 0) this.sections.push({
                project: null, tasks: temp.none,
            });
        });
    }

    private createTask(text: string, section: Section | null, parentTaskId?: string): Promise<Task> {
        return createTask(text, {
            origin: this.origin,
            projectId: section?.project?.id || this.globalProjectId,
            sprintNumber: this.globalSprintNumber,
            parentTaskId,
        });
    }

    private static reorderTasks(heap: Task[]): Task[] {
        const tasks: Task[] = [];

        for (const t of heap.filter(v => !v.isCompleted && !v.isInDaily)) {
            if (t.parentTaskId !== undefined) continue;
            tasks.push(t, ...this.constructSubTree(heap, t.id));
        }

        for (const t of heap.filter(v => !v.isCompleted && v.isInDaily)) {
            if (t.parentTaskId !== undefined) continue;
            tasks.push(t, ...this.constructSubTree(heap, t.id));
        }

        for (const t of heap.filter(v => v.isCompleted)) {
            if (t.parentTaskId !== undefined) continue;
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

    private static isLastChild(section: Section, taskIndex: number): boolean {
        const isChild = !!section.tasks[taskIndex].parentTaskId;
        const isNextNotChild = section.tasks.length > taskIndex + 1 && !section.tasks[taskIndex + 1].parentTaskId;
        return isChild && isNextNotChild;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
