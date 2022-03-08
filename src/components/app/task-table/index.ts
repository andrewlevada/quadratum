import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, state } from "lit/decorators.js";
import Task, { ActionOrigin } from "~services/task";
import List from "~services/list";
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
    @property() listId!: string;
    @property() origin!: ActionOrigin;
    @state() sections: Section[] | null = null;

    render(): TemplateResult {
        return this.sections ? html`
            <div class="container">
                ${this.sections.map(section => html`
                    ${section.tasks.map((task, i) => html`
                        ${i === 0 ? html`<p class="project">${task.projectId}</p>` : ""}
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

    connectedCallback() {
        super.connectedCallback();
        if (!this.listId) throw new Error("tasks-table requires property listId, but it's not set");
        List.fromId(this.listId).then(list => list.tasks()).then(tasks => {
            const temp: Record<string, Task[]> = {};
            for (const task of tasks) {
                if (!temp[task.projectId]) temp[task.projectId] = [];
                temp[task.projectId].push(task);
            }

            Project.fromIds(Object.keys(temp)).then(projects => {
                this.sections = [];
                for (const project of projects) this.sections.push({
                    project, tasks: temp[project.id], isAddMutated: false,
                });

                if (projects.length === 0) this.sections.push({
                    project: null, tasks: [], isAddMutated: false,
                });
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
            projectId: section.project?.id || null,
            listId: this.listId,
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
