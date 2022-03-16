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

    private hasSiblings = false;
    private childrenTasks: number[] = [];
    private parentTasks: number[] = [];

    render(): TemplateResult {
        return html`
            <div class="progress flex row">
                <div class="quick-actions flex row align-center">
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
        if (this.origin === "daily") return html`
            <mwc-icon-button icon="close" title="Remove from daily list"
                             @click=${() => {
                                 this.task.removeFromDailyList(this.section.tasks);
                                 this.dispatchSimpleEvent("requestReorder");
                             }}></mwc-icon-button>
        `;

        if (this.origin === "backlog" && this.isSub()) return html`<span></span><span></span>`;
        if (this.origin === "backlog") return html`
            <mwc-icon-button icon="expand_less" title="Move to current sprint"
                             @click=${() => {
                                 getCurrentSprintNumber().then(currentSprintNumber => {
                                     for (const t of this.getChildrenTasks()) t.sprintNumber = currentSprintNumber;
                                     this.popTaskFromSection();
                                 });
                             }}></mwc-icon-button>
            <mwc-icon-button icon="chevron_right" title="Move to next sprint"
                             @click=${() => {
                                 getCurrentSprintNumber().then(currentSprintNumber => {
                                     for (const t of this.getChildrenTasks()) t.sprintNumber = currentSprintNumber + 1;
                                     this.popTaskFromSection();
                                 });
                             }}></mwc-icon-button>
        `;

        if (this.origin === "sprint" && this.currentSprintDelta === 0) return html`
            ${this.isSub() ? html`<span></span>` : ""}

            <mwc-icon-button icon="fullscreen" title="Add to daily list"
                             @click=${() => {
                                 for (const t of this.getChildrenTasks()) t.isInDaily = true;
                                 for (const t of this.getParentTasks()) t.isInDaily = true;
                                 this.requestUpdate();
                                 this.dispatchSimpleEvent("requestReorder");
                             }}></mwc-icon-button>

            ${!this.isSub() ? html`
                <mwc-icon-button icon="chevron_right" title="Move to next sprint"
                                 @click=${() => {
                                     // TODO: Add sprint existance check here
                                     for (const t of this.getChildrenTasks()) {
                                         t.sprintNumber! += 1;
                                         t.isInDaily = false;
                                     }
                                     this.popTaskFromSection();
                                 }}></mwc-icon-button>
            ` : ""}
        `;

        if (this.origin === "sprint" && this.isSub()) return html`<span></span>`;

        if (this.origin === "sprint" && this.currentSprintDelta > 0) return html`
            <mwc-icon-button icon="expand_more" title="Move to backlog"
                             @click=${() => {
                                 for (const t of this.getChildrenTasks()) t.sprintNumber = null;
                                 this.popTaskFromSection();
                             }}></mwc-icon-button>
        `;

        if (this.origin === "sprint" && this.currentSprintDelta < 0) return html`
            <mwc-icon-button icon="chevron_right" title="Move to current sprint"
                             @click=${() => {
                                 for (const t of this.getChildrenTasks()) {
                                     t.sprintNumber! -= this.currentSprintDelta;
                                     t.isInDaily = false;
                                 }
                                 this.popTaskFromSection();
                             }}></mwc-icon-button>
        `;

        throw new Error("Wrong value of origin prop in task-table");
    }

    private actionsHtml(): TemplateResult {
        return html`
            ${this.task.progress && this.task.progress.length > 0 ? html`
                <mwc-list-item @click=${() => {
                    if (!this.task.progress) return;
                    this.task.updateProgress(this.task.progress.slice(0, this.task.progress.length - 1));
                    this.requestUpdate();
                    this.dispatchSimpleEvent("requestReorder");
                }}>Remove progress point</mwc-list-item>
            ` : ""}

            ${this.origin !== "backlog" ? html`
                <mwc-list-item @click=${() => {
                    for (const t of this.getChildrenTasks()) t.sprintNumber = null;
                    this.popTaskFromSection();
                }}>Move to backlog</mwc-list-item>
            ` : ""}
            
            ${this.origin === "sprint" ? html`
                <mwc-list-item @click=${() => {
                    for (const t of this.getChildrenTasks()) t.sprintNumber! += 1;
                    this.popTaskFromSection();
                }}>Move a sprint ahead</mwc-list-item>

                <mwc-list-item @click=${() => {
                    for (const t of this.getChildrenTasks()) t.sprintNumber! -= 1;
                    this.popTaskFromSection();
                }}>Move a sprint behind</mwc-list-item>
            ` : ""}
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.actionsMenu.anchor = this.actionsButton;

        this.childrenTasks = [this.taskIndex];
        for (let i = this.taskIndex + 1; i < this.section.tasks.length; i++) {
            const t = this.section.tasks[i];
            if (t.parentTaskId === this.task.id) this.childrenTasks.push(i);
            if (t.parentTaskId === this.task.parentTaskId && this.task.parentTaskId)
                this.hasSiblings = true;
        }

        let parentId = this.task.parentTaskId;
        if (parentId) for (let i = this.taskIndex - 1; i >= 0; i--) {
            const t = this.section.tasks[i];
            if (t.id === parentId) {
                this.parentTasks.push(i);
                parentId = t.id;
            }
            if (t.parentTaskId === this.task.parentTaskId && this.task.parentTaskId)
                this.hasSiblings = true;
        }
    }

    private isSub(): boolean {
        return !!this.task.parentTaskId;
    }

    private popTaskFromSection(additionalIndexes?: number[]) {
        for (let i = this.section.tasks.length - 1; i >= 0; i--)
            if (this.childrenTasks.includes(i) || additionalIndexes?.includes(i))
                this.section.tasks.splice(i, 1);

        this.dispatchSimpleEvent("requestReorder");
    }

    private getChildrenTasks = () => this.childrenTasks.map(index => this.section.tasks[index]);
    private getParentTasks = () => this.parentTasks.map(index => this.section.tasks[index]);

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles as never];
    }
}
