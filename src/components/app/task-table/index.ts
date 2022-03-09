import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, state } from "lit/decorators.js";
import Task, { ActionOrigin } from "~services/task";
import Project from "~services/project";
import scopedStyles from "./styles.module.scss";
import "@material/mwc-button";

interface Section {
    project: Project | null;
    tasks: Task[];
    isAddMutated: boolean;
}

export default (): void => defineComponent("task-table", TaskTable);
export class TaskTable extends LitElement {
    @property() tasks!: Task[];
    @property() origin!: ActionOrigin;
    @property() globalSprintNumber?: number;
    @property() globalProjectId?: string;
    @state() sections: Section[] | null = null;

    render(): TemplateResult {
        return this.sections ? html`
            <div class="container">
                ${this.sections.map(section => html`
                    ${section.tasks.map((task, i) => html`
                        ${i === 0 && !this.globalProjectId ? html`<p class="project">${task.projectId}</p>` : ""}
                        <p class="text">${task.text}</p>
                        <input class="progress" type="checkbox">
                    `)}

                    ${!section.isAddMutated ? html`
                        <mwc-button class="add-button" label="Create task"
                                    @click=${() => this.mutateAddButton(section)}></mwc-button>
                    ` : html`
                        <input class="add-input" type="text"
                               @keyup=${(event: KeyboardEvent) => this.onAddInputKeyUp(event, section)}>
                    `}
                `)}
            </div>
        ` : html``;
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

        const fetchProjects = Object.keys(temp);
        fetchProjects.shift();
        Project.fromIds(fetchProjects).then(projects => {
            this.sections = [];
            for (const project of projects) this.sections.push({
                project, tasks: temp[project.id], isAddMutated: false,
            });

            // Always have an add button at the end
            if (temp.none.length > 0 || fetchProjects.length === 0) this.sections.push({
                project: null, tasks: temp.none, isAddMutated: false,
            });
        });
    }

    private mutateAddButton(section: Section) {
        section.isAddMutated = true;
        this.requestUpdate();
    }

    private onAddInputKeyUp(event: KeyboardEvent, section: Section) {
        if (event.key !== "Enter") return;
        Task.create((event.target as HTMLInputElement).value, {
            origin: this.origin,
            projectId: section.project?.id || this.globalProjectId || null,
            sprintNumber: typeof this.globalSprintNumber === "number" ? this.globalSprintNumber : null,
        }).then(task => {
            section.tasks.push(task);
            section.isAddMutated = false;
            this.requestUpdate();
        });
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles as never];
    }
}
