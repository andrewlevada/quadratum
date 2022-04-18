import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { AppPageElement } from "~components/app-container/router/app-router";
import Milestone from "~src/models/milestone";

import("~components/common/card-surface").then(f => f.default());
import("~components/milestones/milestone-item").then(f => f.default());

@customElement("app-page--milestones")
export default class AppPageMilestones extends AppPageElement {
    @state() milestones: Milestone[] = [];
    @state() isCreatingNew: boolean = false;

    render(): TemplateResult {
        return html`
            <div class="flex col app-page gap big-gap">
                <div class="flex row justify-between align-center full-width">
                    <h4>Milestones</h4>
                </div>
                
                <div class="two-columns">
                    <div class="flex col gap big-gap flex-grow">
                        <h6>Ongoing</h6>
                        
                        ${this.milestones.filter(v => !v.isArchived && !v.isFinished).map(milestone => html`
                            <milestone-item .value=${milestone} detailed></milestone-item>
                        `)}

                        <card-surface class="clickable" type="outlined">
                            <div class="flex row gap">
                                <span class="material-icons">add</span>
                                <p>Set new milestone!</p>
                            </div>
                        </card-surface @click=${() => {
                            this.isCreatingNew = true;
                        }}>
                    </div>

                    <div class="flex-grow">
                        <h6>Closed</h6>

                        ${this.milestones.filter(v => v.isArchived || v.isFinished).map(milestone => html`
                            <milestone-item .value=${milestone} detailed></milestone-item>
                        `)}
                    </div>
                </div>
            </div>
        `;
    }

    requestReload() {
        super.requestReload();
        this.unsubscribeFromListeners();
        this.isCreatingNew = false;

        this.dataListeners.push(Milestone.listenForAll(milestones => {
            this.milestones = milestones;
        }));
    }

    static styles = [...pageStyles];
}
