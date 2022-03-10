/* eslint-disable indent */
import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, state } from "lit/decorators.js";
import Task, { ActionOrigin } from "~services/task";
import Project from "~services/project";
import { getCurrentSprintNumber } from "~services/sprint/data";
import scopedStyles from "./styles.module.scss";
import "@material/mwc-icon-button";

import("~components/common/square-checkbox").then(f => f.default());
import("./add-button").then(f => f.default());

interface Section {
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
                            <p class="project">${section.project?.label || "None"}</p>
                        ` : ""}

                        <p class="text flex row align-center ${task.parentTaskId ? "sub" : ""}">
                            ${task.text}
                            
                            <add-button sub @create=${(event: CustomEvent) => {
                                this.createTask(event.detail.value, section, task.parentTaskId || task.id);
                            }}></add-button>
                        </p>
                        
                        <div class="progress flex row">
                            <div class="quick-actions flex row align-center ${task.parentTaskId ? "sub" : ""}">
                                ${this.quickActionsHtml(section, task, i)}
                            </div>
                            
                            <div class="checkboxes flex row gap align-center">
                                ${task.progress ? task.progress.map((v, pI) => html`
                                    <square-checkbox ?checked=${v} @change=${(event: CustomEvent) => {
                                        task.progress![pI] = event.detail.value as boolean;
                                        task.updateProgress();
                                        this.requestUpdate("sections");
                                    }}></square-checkbox>
                                `) : ""}

                                <mwc-icon-button icon="add_box" @click=${() => {
                                    const progress = task.progress || [];
                                    progress.push(false);
                                    task.updateProgress(progress);
                                    this.requestUpdate("sections");
                                }}></mwc-icon-button>
                            </div>
                        </div>
                    `)}

                    <add-button @create=${(event: CustomEvent) => {
                        this.createTask(event.detail.value, section);
                    }}></add-button>
                `)}
            </div>
        ` : html``;
    }

    private quickActionsHtml(section: Section, task: Task, taskIndex: number): TemplateResult {
        const popTask = () => {
            section.tasks.splice(taskIndex, 1);
            this.requestUpdate();
        };

        if (this.origin === "daily") return html`
            <mwc-icon-button icon="cancel" @click=${() => {
                task.isInDaily = false;
                popTask();
            }}></mwc-icon-button>
        `;

        if (this.origin === "backlog") return html`
            <mwc-icon-button icon="arrow_upward" @click=${() => {
                getCurrentSprintNumber().then(currentSprintNumber => {
                    task.sprintNumber = currentSprintNumber;
                    popTask();
                });
            }}></mwc-icon-button>
            <mwc-icon-button icon="moving" @click=${() => {
                getCurrentSprintNumber().then(currentSprintNumber => {
                    task.sprintNumber = currentSprintNumber + 1;
                    popTask();
                });
            }}></mwc-icon-button>
        `;

        if (this.origin === "sprint" && this.isCurrentSprint) return html`
            <mwc-icon-button icon="arrow_circle_down" @click=${() => {
                task.isInDaily = true;
            }}></mwc-icon-button>
            <mwc-icon-button icon="arrow_upward" @click=${() => {
                task.sprintNumber = null;
                task.isInDaily = false;
                popTask();
            }}></mwc-icon-button>
            <mwc-icon-button icon="arrow_forward" @click=${() => {
                // TODO: Add sprint existance check here
                task.sprintNumber = this.globalSprintNumber! + 1;
                task.isInDaily = false;
                popTask();
            }}></mwc-icon-button>
        `;

        if (this.origin === "sprint" && !this.isCurrentSprint) return html`
            <mwc-icon-button icon="arrow_back" @click=${() => {
                // TODO: Add sprint existance check here
                task.sprintNumber = this.globalSprintNumber! - 1;
                popTask();
            }}></mwc-icon-button>
            <mwc-icon-button icon="arrow_upward" @click=${() => {
                task.sprintNumber = null;
                popTask();
            }}></mwc-icon-button>
            <mwc-icon-button icon="arrow_forward" @click=${() => {
                // TODO: Add sprint existance check here
                task.sprintNumber = this.globalSprintNumber! + 1;
                popTask();
            }}></mwc-icon-button>
        `;

        throw new Error("Wrong value of origin prop in task-table");
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        if (!this.tasks) throw new Error("tasks-table requires property tasks, but it's not set");

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
            projectId: section.project?.id || this.globalProjectId || null,
            sprintNumber: typeof this.globalSprintNumber === "number" ? this.globalSprintNumber : null,
            parentTaskId,
        }).then(task => {
            section.tasks.push(task);
            section.tasks = TaskTable.reorderTasks(section.tasks);
            this.requestUpdate();
        });
    }

    private static reorderTasks(heap: Task[]): Task[] {
        const tasks: Task[] = [];

        for (const t of heap) {
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
