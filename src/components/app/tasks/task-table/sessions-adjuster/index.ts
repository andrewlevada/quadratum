import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property } from "lit/decorators.js";
import scopedStyles from "../styles.lit.scss";
import Task from "~src/models/task";

import("~components/common/square-checkbox").then(f => f.default());

export default (): void => defineComponent("sessions-adjuster", SessionsAdjuster);
export class SessionsAdjuster extends LitElement {
    @property({ type: Object }) task!: Task;

    private get value(): number { return this.task.sessions; }

    render(): TemplateResult {
        return html`
            <div class="flex row">
                ${this.value > 0 ? html`
                    <square-checkbox class="item" icon="remove" @change=${(e: Event) => {
                        e.stopPropagation();
                        this.updateTaskSessions(-1);
                    }}></square-checkbox>
                ` : ""}

                <square-checkbox class="item" label=${this.value}></square-checkbox>

                <square-checkbox class="item" icon="add" @change=${(e: Event) => {
                    e.stopPropagation();
                    this.updateTaskSessions(1);
                }}></square-checkbox>
            </div>
        `;
    }

    private updateTaskSessions(delta: number) {
        if (delta > 0) {
            const append = new Array(delta);
            append.fill(false);
            this.task.progress = this.task.progress.concat(append);
        }

        if (delta < 0) {
            this.task.progress = this.task.progress.slice(0, this.value + delta);
        }
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
