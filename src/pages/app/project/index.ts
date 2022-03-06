import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import Project from "~services/project";

import("~components/app/task-table").then(f => f.default());

@customElement("app-page--project")
export default class AppPageProject extends LitElement {
    @state() project: Project | null = null;

    render(): TemplateResult {
        return html`
            <h4>Project: ${this.project?.label || ""}</h4>
            ${this.project ? html`<task-table .listId=${this.project.backlogListId}></task-table>` : ""}
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        const projectId = window.location.pathname.split("/").last();

        Project.fromId(projectId).then(value => {
            this.project = value;
        });
    }

    static get styles(): CSSResultGroup {
        // Styles can either be in this file (only css)
        // or imported from another file (scss in this case)
        return [...pageStyles, css`
          // More styles here
        `];
    }
}
