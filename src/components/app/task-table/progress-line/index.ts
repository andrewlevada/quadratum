import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { property, query } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import "@material/mwc-icon-button";
import "@material/mwc-menu";
import Task, { ActionOrigin } from "~services/task";
import { getCurrentSprintNumber } from "~services/sprint/data";
import { Section } from "~components/app/task-table";
import { Menu } from "@material/mwc-menu";
import { ifDefined } from "lit/directives/if-defined.js";
import scopedStyles from "./styles.module.scss";

export default (): void => defineComponent("progress-line", ProgressLine);
export class ProgressLine extends LitElement {
    @property({ type: Object }) task!: Task;
    @property({ type: Object }) section!: Section;
    @property({ type: Number }) taskIndex!: number;
    @property({ type: String }) origin!: ActionOrigin;
    @property({ type: Number }) currentSprintDelta!: number;

    @query("#actions-menu") actionsMenu!: Menu;
    @query("#actions-button") actionsButton!: HTMLElement;

    render(): TemplateResult {
        return html`
            <div class="progress flex row">
                <div class="quick-actions flex row align-center ${this.task.parentTaskId ? "sub" : ""}">
                    ${this.quickActionsHtml()}

                    <mwc-icon-button id="actions-button" icon="more_horiz" @click=${() => {
                        this.actionsMenu.open = true;
                    }}></mwc-icon-button>

                    <mwc-menu id="actions-menu">
                        ${this.actionsHtml()}
                    </mwc-menu>
                </div>

                <div class="checkboxes flex row align-center">
                    ${(this.task.progress || []).map((v, pI) => html`
                        <square-checkbox ?checked=${v}
                                         ?marked=${this.task.isInDaily && this.origin !== "daily"}
                                         .color=${ifDefined(this.section.project?.color || undefined)}
                                         @change=${(event: CustomEvent) => {
                                             this.task.progress![pI] = event.detail.value as boolean;
                                             this.task.updateProgress();
                                             this.dispatchSimpleEvent("requestReorder");
                                         }}></square-checkbox>
                    `)}

                    <mwc-icon-button icon="add_box" @click=${() => {
                        const progress = this.task.progress || [];
                        progress.push(false);
                        this.task.updateProgress(progress);
                        this.requestUpdate();
                        this.dispatchSimpleEvent("requestReorder");
                    }}></mwc-icon-button>
                </div>
            </div>
        `;
    }

    private quickActionsHtml(): TemplateResult {
        let affectedTasksNumber = 1;
        for (let i = this.taskIndex + 1; i < this.section.tasks.length; i++)
            if (this.section.tasks[i].parentTaskId === this.task.id) affectedTasksNumber++;
            else break;

        const popTasks = () => {
            // This removal of tasks relies heavily on how they are displayed.
            // Change this in the future, as it can and will lead to bugs
            this.section.tasks.splice(this.taskIndex, affectedTasksNumber);
            this.dispatchSimpleEvent("requestReorder");
        };

        const affectedTasks = () => this.section.tasks.slice(this.taskIndex, this.taskIndex + affectedTasksNumber);

        if (this.origin === "daily") return html`
            <mwc-icon-button icon="close" title="Remove from daily list"
                             @click=${() => {
                                 for (const t of affectedTasks()) t.isInDaily = false;
                                 popTasks();
                             }}></mwc-icon-button>
        `;

        if (this.origin === "backlog") return html`
            <mwc-icon-button icon="expand_less" title="Move to current sprint"
                             @click=${() => {
                                 getCurrentSprintNumber().then(currentSprintNumber => {
                                     for (const t of affectedTasks()) t.sprintNumber = currentSprintNumber;
                                     popTasks();
                                 });
                             }}></mwc-icon-button>
            <mwc-icon-button icon="chevron_right" title="Move to next sprint"
                             @click=${() => {
                                 getCurrentSprintNumber().then(currentSprintNumber => {
                                     for (const t of affectedTasks()) t.sprintNumber = currentSprintNumber + 1;
                                     popTasks();
                                 });
                             }}></mwc-icon-button>
        `;

        if (this.origin === "sprint" && this.currentSprintDelta === 0) return html`
            <mwc-icon-button icon="fullscreen" title="Add to daily list"
                             @click=${() => {
                                 for (const t of affectedTasks()) t.isInDaily = true;
                                 this.requestUpdate();
                             }}></mwc-icon-button>
            <mwc-icon-button icon="chevron_right" title="Move to next sprint"
                             @click=${() => {
                                 // TODO: Add sprint existance check here
                                 for (const t of affectedTasks()) t.sprintNumber! += 1;
                                 for (const t of affectedTasks()) t.isInDaily = false;
                                 popTasks();
                             }}></mwc-icon-button>
        `;

        if (this.origin === "sprint" && this.currentSprintDelta > 0) return html`
            <mwc-icon-button icon="expand_more" title="Move to backlog"
                             @click=${() => {
                                 for (const t of affectedTasks()) t.sprintNumber = null;
                                 popTasks();
                             }}></mwc-icon-button>
        `;

        if (this.origin === "sprint" && this.currentSprintDelta < 0) return html`
            <mwc-icon-button icon="chevron_right" title="Move to current sprint"
                             @click=${() => {
                                 for (const t of affectedTasks()) t.sprintNumber! -= this.currentSprintDelta;
                                 for (const t of affectedTasks()) t.isInDaily = false;
                                 popTasks();
                             }}></mwc-icon-button>
        `;

        throw new Error("Wrong value of origin prop in task-table");
    }

    private actionsHtml(): TemplateResult {
        return html`
            <mwc-list-item @click=${() => {
                if (!this.task.progress) return;
                this.task.updateProgress(this.task.progress.slice(0, this.task.progress.length - 1));
                this.requestUpdate();
                this.dispatchSimpleEvent("requestReorder");
            }}>Remove progress point</mwc-list-item>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.actionsMenu.anchor = this.actionsButton;
    }

    private isSub(): boolean {
        return !!this.task.parentTaskId;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles as never];
    }
}
