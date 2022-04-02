import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property } from "lit/decorators.js";
import Task from "~src/models/task";
import { setActiveTask } from "~src/models/user-service";
import { timestampToRelativeString } from "~utils/time";

export type TaskItemDisplay = "pending" | "active" | "completed";

export default (): void => defineComponent("task-item", TaskItem);
export class TaskItem extends LitElement {
    @property({ type: Object }) task!: Task;
    @property({ type: String }) displayType!: TaskItemDisplay;

    render(): TemplateResult {
        return html`
            <div class="flex row gap">
                ${this.displayType === "pending" ? html`
                    <square-checkbox .label=${this.getPendingCheckboxValue()}
                                     @click=${() => {
                                         setActiveTask(this.task.id).then();
                                     }}></square-checkbox>
                ` : ""}

                <div class="flex col">
                    <p class="text">${this.task.text}</p>
                    <div class="flex row justify-between">
                        <p class="scope">Scope</p>
                        ${this.displayType !== "completed" ? html`
                            <div class="flex row">${this.infoBadge()}</div>
                        ` : ""}
                    </div>
                </div>

                ${this.displayType !== "pending" && this.task.progress ? html`
                    <div class="flex row gap">
                        ${this.task.progress.map((v, i) => html`
                            <square-checkbox ?checked=${v}
                                             @change=${(event: CustomEvent) => {
                                                 const newProgress = this.task.progress!;
                                                 newProgress[i] = event.detail.value as boolean;
                                                 this.task.progress = newProgress;
                                                 this.dispatchSimpleEvent("taskChange");
                                             }}></square-checkbox>
                        `)}
                    </div>
                ` : ""}
            </div>
        `;
    }

    private infoBadge(): TemplateResult {
        if (this.task.dueDate) return html`
            <div class="flex row">
                <p>${timestampToRelativeString(this.task.dueDate)}</p>
                <span class="material-icons">schedule</span>
            </div>
        `;

        return html``;
    }

    private getPendingCheckboxValue(): string {
        if (this.task.sessions === 0) return "";
        return this.task.sessions.toString();
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          .text {
            font-weight: 500;
            font-size: 16px;
            line-height: 18px;
          }
          
          .scope {
            font-size: 14px;
            line-height: 20px;
          }
        `];
    }
}
