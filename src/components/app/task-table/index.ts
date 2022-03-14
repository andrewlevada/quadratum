/* eslint-disable indent */
import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, state } from "lit/decorators.js";
import Task, { ActionOrigin } from "~services/task";
import Project from "~services/project";
import scopedStyles from "./styles.module.scss";
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
    @property({ type: Boolean }) isCurrentSprint?: boolean;
    @state() sections: Section[] | null = null;

    render(): TemplateResult {
        return this.sections ? html`
            <div class="container">
                ${this.sections.map(section => html`
                    ${section.tasks.map((task, i) => html`
                        ${i === 0 && !this.globalProjectId ? html`
                            <color-chip class="project" color=${section.project?.color || "#dedede"}>
                                ${section.project?.label || "None"}
                            </color-chip>
                        ` : ""}

                        <div class="text flex row align-center ${task.parentTaskId ? "sub" : ""}">
                            <inline-text-input value=${task.text}
                                               class=${task.isDone() ? "fade" : ""}
                                               @update=${(event: CustomEvent) => {
                                task.text = (event.detail.value as string).trim();
                            }} @clear=${() => {
                                section.tasks.splice(i, 1)[0].delete().then();
                                this.requestUpdate("sections");
                            }}></inline-text-input>
                            
                            <add-button sub @create=${(event: CustomEvent) => {
                                this.createTask(event.detail.value, section, task.parentTaskId || task.id);
                            }}></add-button>
                        </div>
                        
                        <progress-line class="progress" .section=${section}
                                       .task=${task} .taskIndex=${i} .isCurrentSprint=${this.isCurrentSprint}
                                       .origin=${this.origin} @requestReorder=${() => {
                                           this.requestUpdate();
                        }}></progress-line>
                    `)}

                    <add-button @create=${(event: CustomEvent) => {
                        this.createTask(event.detail.value, section);
                    }}></add-button>
                `)}
            </div>
        ` : html``;
    }

    protected update(changedProperties: PropertyValues) {
        super.update(changedProperties);
        if (!this.tasks) throw new Error("tasks-table requires property tasks, but it's not set");
        if (!changedProperties.has("tasks")) return;

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
            this.sections = [];
            for (const project of projects) this.sections.push({
                project, tasks: temp[project.id],
            });

            // Always have an add button at the end
            if (temp.none.length > 0 || fetchProjects.length === 0) this.sections.push({
                project: null, tasks: temp.none,
            });
        });
    }

    private createTask(text: string, section: Section, parentTaskId?: string) {
        Task.create(text, {
            origin: this.origin,
            projectId: section.project?.id || this.globalProjectId,
            sprintNumber: this.globalSprintNumber,
            parentTaskId,
        }).then(task => {
            section.tasks.push(task);
            section.tasks = TaskTable.reorderTasks(section.tasks);
            this.requestUpdate();
        });
    }

    private static reorderTasks(heap: Task[]): Task[] {
        const tasks: Task[] = [];

        for (const t of heap.filter(v => !v.isDone())) {
            if (t.parentTaskId !== undefined) continue;
            tasks.push(t, ...this.constructSubTree(heap, t.id));
        }

        for (const t of heap.filter(v => v.isDone())) {
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

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles as never];
    }
}
