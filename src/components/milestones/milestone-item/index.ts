import { html, LitElement, TemplateResult } from "lit";
import { defineComponent } from "~utils/components";
import scopedStyles from "./styles.lit.scss";
import { componentStyles } from "~src/global";
import { property } from "lit/decorators.js";
import Milestone from "~src/models/milestone";

import("~components/common/card-surface").then(f => f.default());

export default (): void => defineComponent("milestone-item", MilestoneItem);
export class MilestoneItem extends LitElement {
    @property({ type: Object }) value!: Milestone;
    @property({ type: Boolean }) detailed: boolean = false;

    render(): TemplateResult {
        return html`
            <card-surface type="outlined">
                <div class="flex col">
                    <div class="flex row justify-between">
                        <p>${this.value.label}</p>
                        
                        <div class="flex row gap">
                            <p></p>
                            <span class="material-icons">schedule</span>
                        </div>
                    </div>
                    
                    ${this.detailed ? html`
                        <p>${this.value.description}</p>
                        <p>${this.getProgressText()}</p>
                    ` : html`
                        
                    `}
                </div>
            </card-surface>
        `;
    }

    private getProgressText(): string {
        const progressDetails = `(${this.value.completedSessions} / ${this.value.totalSessions})`;
        return `Progress: ${Math.round(this.getCompletionProgress())}% ${progressDetails} - ${this.getExpectedProgress()}% expected`;
    }

    private getCompletionProgress(): number {
        return this.value.completedSessions / this.value.totalSessions;
    }

    private getExpectedProgress(): number {
        const duration = this.value.dueDate - this.value.startDate;
        const passed = new Date().getTime() - this.value.startDate;
        return passed / duration;
    }

    static styles = [...componentStyles, scopedStyles];
}
