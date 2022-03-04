import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { getSprintById, Sprint } from "~services/sprints-service";

import("~components/app/tasks-table").then(f => f.default());

@customElement("app-page--sprint")
export default class AppPageSprintList extends LitElement {
    @state() sprint: Sprint | null = null;

    render(): TemplateResult {
        return html`
            <h4>Sprint ${this.sprint?.number || ""}</h4>
            ${this.sprint ? html`<task-table .listId=${this.sprint.listId}></task-table>` : ""}
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        const sprintId = window.location.pathname.split("/").last();

        getSprintById(sprintId).then(value => {
            this.sprint = value;
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
