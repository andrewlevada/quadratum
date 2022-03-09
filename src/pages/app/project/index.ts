import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { pageStyles } from "~src/global";
import Project from "~services/project";
import Task from "~services/task";

import("~components/app/task-table").then(f => f.default());

@customElement("app-page--project")
export default class AppPageProject extends LitElement {
    @state() project: Project | null = null;
    @state() tasks: Task[] | null = null;
    @state() noneProject: boolean = false;

    render(): TemplateResult {
        return html`
            <div class="flex col app-page">
                <h4>Project: ${this.project?.label || ""}</h4>
                ${this.tasks ? html`
                    <task-table .tasks=${this.tasks} origin="backlog"
                                globalProjectId=${ifDefined(this.noneProject ? undefined : this.project!.id)}></task-table>
                ` : ""}
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        const projectId = window.location.pathname.split("/").last();

        if (projectId === "none") {
            this.noneProject = true;
            Task.noProject().then(tasks => {
                this.tasks = tasks;
            });
        } else Promise.all([Project.fromId(projectId), Project.tasks(projectId)])
            .then(([project, tasks]) => {
                this.project = project;
                this.tasks = tasks;
            });
    }

    static get styles(): CSSResultGroup {
        return [...pageStyles, css``];
    }
}
