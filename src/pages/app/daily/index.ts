import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { getDailyListId } from "~services/user-service";

import("~components/app/task-table").then(f => f.default());

@customElement("app-page--daily")
export default class AppPageDailyList extends LitElement {
    @state() dailyListId: string | null = null;

    render(): TemplateResult {
        return html`
            <div class="flex col app-page">
                <h4>Daily List</h4>
                ${this.dailyListId ? html`<task-table listId=${this.dailyListId}></task-table>` : ""}
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        getDailyListId().then(value => {
            this.dailyListId = value;
        });
    }

    static get styles(): CSSResultGroup {
        return [...pageStyles, css`
          
        `];
    }
}
