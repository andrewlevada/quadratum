import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { property, query } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import "@material/mwc-icon-button";
import "@material/mwc-icon";
import "@material/mwc-menu";
import Task, { ActionOrigin } from "~services/task";
import { getCurrentSprintNumber } from "~services/sprint/data";
import { Section } from "~components/app/task-table";
import { Menu } from "@material/mwc-menu";
import { ifDefined } from "lit/directives/if-defined.js";
import { TaskContextModifier } from "~services/task/task-context-modifier";
import scopedStyles from "./styles.lit.scss";

export default (): void => defineComponent("progress-line", ProgressLine);
export class ProgressLine extends LitElement {
    @property({ type: Object }) task!: Task;
    @property({ type: Array }) contextTasks!: Task[];
    @property({ type: Object }) section!: Section;
    @property({ type: Number }) taskIndex!: number;
    @property({ type: String }) origin!: ActionOrigin;
    @property({ type: Number }) currentSprintDelta!: number;

    @query("#actions-menu") actionsMenu!: Menu;
    @query("#actions-button") actionsButton!: HTMLElement;

    private taskModifier!: TaskContextModifier;

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
                                             this.dispatchSimpleEvent("taskChange");
                                         }}></square-checkbox>
                    `)}

                    <mwc-icon-button icon="add_box" @click=${() => {
                        const progress = this.task.progress || [];
                        progress.push(false);
                        this.task.updateProgress(progress);
                        this.requestUpdate();
                        this.dispatchSimpleEvent("taskChange");
                    }}></mwc-icon-button>
                </div>
            </div>
        `;
    }

    private quickActionsHtml(): TemplateResult {
        if (this.origin === "daily") return html`
            <mwc-icon-button icon="close" title="Remove from daily list"
                             @click=${() => {
                                 this.taskModifier.setIsInDaily(false, true);
                                 this.dispatchSimpleEvent("requestReorder");
                             }}></mwc-icon-button>
        `;

        if (this.origin === "backlog" && this.isSub()) return html`<span></span><span></span>`;
        if (this.origin === "backlog") return html`
            <mwc-icon-button icon="expand_less" title="Move to current sprint"
                             @click=${() => {
                                 getCurrentSprintNumber().then(currentSprintNumber => {
                                     this.taskModifier.setSprintNumber(currentSprintNumber);
                                     this.dispatchSimpleEvent("requestReorder");
                                 });
                             }}></mwc-icon-button>
            <mwc-icon-button icon="chevron_right" title="Move to next sprint"
                             @click=${() => {
                                 getCurrentSprintNumber().then(currentSprintNumber => {
                                     this.taskModifier.setSprintNumber(currentSprintNumber + 1);
                                     this.dispatchSimpleEvent("requestReorder");
                                 });
                             }}></mwc-icon-button>
        `;

        if (this.origin === "sprint" && this.currentSprintDelta === 0) return html`
            ${this.isSub() ? html`<span></span>` : ""}

            <mwc-icon-button icon="fullscreen" title="Add to daily list"
                             @click=${() => {
                                 this.taskModifier.setIsInDaily(true, false);
                                 this.requestUpdate();
                                 this.dispatchSimpleEvent("requestReorder");
                             }}></mwc-icon-button>

            ${!this.isSub() ? html`
                <mwc-icon-button icon="chevron_right" title="Move to next sprint"
                                 @click=${() => {
                                     this.taskModifier.setSprintNumber(this.task.sprintNumber! + 1);
                                     this.dispatchSimpleEvent("requestReorder");
                                 }}></mwc-icon-button>
            ` : ""}
        `;

        if (this.origin === "sprint" && this.isSub()) return html`<span></span>`;

        if (this.origin === "sprint" && this.currentSprintDelta > 0) return html`
            <mwc-icon-button icon="expand_more" title="Move to backlog"
                             @click=${() => {
                                 this.taskModifier.setSprintNumber(null);
                                 this.dispatchSimpleEvent("requestReorder");
                             }}></mwc-icon-button>
        `;

        if (this.origin === "sprint" && this.currentSprintDelta < 0) return html`
            <mwc-icon-button icon="chevron_right" title="Move to current sprint"
                             @click=${() => {
                                 this.taskModifier.setSprintNumber(this.task.sprintNumber! - this.currentSprintDelta);
                                 this.dispatchSimpleEvent("requestReorder");
                             }}></mwc-icon-button>
        `;

        throw new Error("Wrong value of origin prop in task-table");
    }

    private actionsHtml(): TemplateResult {
        return html`
            ${this.task.progress && this.task.progress.length > 0 ? html`
                <mwc-list-item graphic="icon" @click=${() => {
                    if (!this.task.progress) return;
                    this.task.updateProgress(this.task.progress.slice(0, this.task.progress.length - 1));
                    this.requestUpdate();
                    this.dispatchSimpleEvent("requestReorder");
                }}>
                    <span>Remove progress point</span>
                    <mwc-icon slot="graphic">disabled_by_default</mwc-icon>
                </mwc-list-item>
            ` : ""}

            ${this.origin !== "daily" ? html`
                <mwc-list-item graphic="icon" @click=${() => {
                    this.taskModifier.setIsInDaily(true, this.origin !== "sprint" && this.currentSprintDelta !== 0);
                    this.requestUpdate();
                    this.dispatchSimpleEvent("requestReorder");
                }}>
                    <span>Add to daily list</span>
                    <mwc-icon slot="graphic">star</mwc-icon>
                </mwc-list-item>
            ` : ""}

            ${this.origin !== "backlog" ? html`
                <mwc-list-item graphic="icon" @click=${() => {
                    this.taskModifier.setSprintNumber(null);
                    this.dispatchSimpleEvent("requestReorder");
                }}>
                    <span>Move to backlog</span>
                    <mwc-icon slot="graphic">archive</mwc-icon>
                </mwc-list-item>
            ` : ""}

            ${this.origin === "sprint" ? html`
                <mwc-list-item graphic="icon" @click=${() => {
                    this.taskModifier.setSprintNumber(this.task.sprintNumber! - 1);
                    this.dispatchSimpleEvent("requestReorder");
                }}>
                    <span>Move a sprint behind</span>
                    <mwc-icon slot="graphic">chevron_left</mwc-icon>
                </mwc-list-item>

                <mwc-list-item graphic="icon" @click=${() => {
                    this.taskModifier.setSprintNumber(this.task.sprintNumber! + 1);
                    this.dispatchSimpleEvent("requestReorder");
                }}>
                    <span>Move a sprint ahead</span>
                    <mwc-icon slot="graphic">chevron_right</mwc-icon>
                </mwc-list-item>
            ` : ""}

            <mwc-list-item graphic="icon" @click=${() => {
                this.taskModifier.deleteTree();
                this.dispatchSimpleEvent("requestReorder");
            }}>
                <span>Delete task</span>
                <mwc-icon slot="graphic">delete</mwc-icon>
            </mwc-list-item>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.actionsMenu.anchor = this.actionsButton;
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has("task"))
            this.taskModifier = this.task.modifier(this.contextTasks);
    }

    private isSub(): boolean {
        return !!this.task.parentTaskId;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
