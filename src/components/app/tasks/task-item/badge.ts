import { html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent, waitForRender } from "~utils/components";
import { property, query, state } from "lit/decorators.js";
import Task from "~src/models/task";
import { timestampToRelativeString } from "~utils/time";
import scopedStyles from "./styles.lit.scss";
import { CalendarInput } from "~components/common/calendar-input";

export default (): void => defineComponent("task-item--badge", TaskItemBadge);
export class TaskItemBadge extends LitElement {
    @property({ type: Object }) task!: Task;

    @state() editing: boolean = false;

    @query("calendar-input") calendarInput: CalendarInput | undefined;

    render(): TemplateResult {
        return html`
            <div class="cell flex row gap align-center"
                 @click=${() => this.onInfoBadgeClick()}>
                ${this.infoBadge()}
            </div>
            
            ${this.editing ? this.badgeEditHtml() : ""}
        `;
    }

    private infoBadge(): TemplateResult {
        if (this.task.dueDate) {
            import("~components/common/calendar-input").then();
            return html`
                <p>${timestampToRelativeString(this.task.dueDate)}</p>
                <span class="material-icons">schedule</span>
            `;
        }

        if (this.task.wasActive) return html`
            <p>Not finished</p>
            <span class="material-icons">pause_circle</span>
        `;

        return html``;
    }

    private badgeEditHtml(): TemplateResult {
        if (this.task.dueDate) return html`
            <calendar-input .value=${new Date(this.task.dueDate)}
                            @change=${() => {
                                const date = this.calendarInput!.date;
                                date.setHours(23, 59, 59, 999);
                                this.task.dueDate = date.getTime();
                            }}></calendar-input>
        `;

        return html``;
    }

    private onInfoBadgeClick(): void {
        this.editing = true;
        if (this.task.dueDate) waitForRender().then(() => {
            this.calendarInput!.anchor = this;
            this.calendarInput!.open()
        });
    }

    static styles = [...componentStyles, scopedStyles];
}
