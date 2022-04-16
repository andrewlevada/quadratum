import { html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent, waitForRender } from "~utils/components";
import { property, query, state } from "lit/decorators.js";
import Task from "~src/models/task";
import { timestampToRelativeString } from "~utils/time";
import scopedStyles from "./styles.lit.scss";
import { CalendarInput } from "~components/common/calendar-input";
import { MilestonesListMenu } from "~components/app/menues/milestones-list-menu";

export default (): void => defineComponent("task-item--badge", TaskItemBadge);
export class TaskItemBadge extends LitElement {
    @property({ type: Object }) task!: Task;

    @state() editing: boolean = false;

    @query("calendar-input") calendarInput: CalendarInput | undefined;
    @query("milestones-list-menu") milestonesMenu: MilestonesListMenu | undefined;

    render(): TemplateResult {
        return html`
            <div class="badge-styling flex row gap align-center"
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

        if (this.task.milestone) {
            import("~components/app/menues/milestones-list-menu").then();
            return html`
                <p>${this.task.milestone.label}</p>
                <span class="material-icons">flag</span>
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

        if (this.task.milestone) return html`
            <milestones-list-menu .milestone=${this.task.milestone}
                                  @change=${() => {
                                      this.task.milestone = this.milestonesMenu!.selected
                                  }}></milestones-list-menu>
        `;

        return html``;
    }

    private onInfoBadgeClick(): void {
        this.editing = true;

        waitForRender().then(() => {
            if (this.task.dueDate) {
                this.calendarInput!.anchor = this;
                this.calendarInput!.open();
                return;
            }

            if (this.task.milestone) {
                this.milestonesMenu!.anchor = this;
                this.milestonesMenu!.open = true;
            }
        });
    }

    static styles = [...componentStyles, scopedStyles];
}
