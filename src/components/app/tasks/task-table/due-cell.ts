import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, query } from "lit/decorators.js";
import Task from "~src/models/task";
import scopedStyles from "./styles.lit.scss";
import { dateToDisplayString } from "~utils/time";
import { CalendarInput } from "~components/common/calendar-input";

import("~components/common/calendar-input").then(f => f.default());

export default (): void => defineComponent("task-table--due-cell", TaskTableDueCell);
export class TaskTableDueCell extends LitElement {
    @property({ type: Object }) task!: Task;

    @query("calendar-input") calendarInput!: CalendarInput;

    render(): TemplateResult {
        return html`
            <div class="cell" @click=${() => {
                this.calendarInput.open();
            }}>
                ${this.task.dueDate ? html`
                    <p>${dateToDisplayString(new Date(this.task.dueDate))}</p>
                ` : html`
                    <square-checkbox icon="schedule"></square-checkbox>
                `}
            </div>

            <calendar-input class="due" @change=${() => {
                const dueDate = this.calendarInput.date;
                dueDate.setHours(23, 59, 59, 999);
                this.task.dueDate = dueDate.getTime();
            }}></calendar-input>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
