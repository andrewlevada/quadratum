import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { getDailyListId } from "~services/daily-list-service";

import("~components/app/tasks-table").then(f => f.default());

@customElement("app-page--daily")
export default class AppPageDailyList extends LitElement {
    @state() dailyListId: string | null = null;

    render(): TemplateResult {
        return html`
            <h4>Daily List</h4>
            ${this.dailyListId ? html`<task-table .listId=${this.dailyListId}></task-table>` : ""}
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        getDailyListId().then(value => {
            this.dailyListId = value;
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
