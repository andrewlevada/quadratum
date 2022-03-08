import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import Sprint from "~services/sprint";

import("~components/app/task-table").then(f => f.default());

@customElement("app-page--sprint")
export default class AppPageSprintList extends LitElement {
    @state() sprint: Sprint | null = null;

    render(): TemplateResult {
        return html`
            <div class="flex col app-page">
                <h4>${this.pageHeader()}</h4>
                ${this.sprint ? html`
                    <task-table .listId=${this.sprint.listId} origin="sprint"></task-table>
                ` : ""}
            </div>
        `;
    }

    private pageHeader(): string {
        if (this.sprint?.number === 0) return "Your First Sprint!";
        return `Sprint ${this.sprint?.number || ""}`;
    }

    connectedCallback() {
        super.connectedCallback();
        const sprintNumber = Number(window.location.pathname.split("/").last());

        Sprint.fromNumber(sprintNumber).then(value => {
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
