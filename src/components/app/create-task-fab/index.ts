import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { state } from "lit/decorators.js";
import scopesStyles from "./styles.lit.scss";

import("~components/common/selection-chip").then(f => f.default());
import("~components/overwrites/md-fab").then(f => f.default());

export default (): void => defineComponent("create-task-fab", CreateTaskFab);
export class CreateTaskFab extends LitElement {
    @state() isDialogShown: boolean = false;

    render(): TemplateResult {
        return html`
            ${this.isDialogShown ? html`
                <div class="surface flex col">
                    <mwc-textfield label="Task name" outlined></mwc-textfield>

                    <div class="flex row justify-between">
                        <selection-chip primary icon="outlined_flag" label="Milestone"></selection-chip>
                        <selection-chip primary icon="schedule" label="Due date"></selection-chip>
                    </div>

                    <div class="flex row justify-between">
                        <h6>Scopes</h6>
                    </div>

                    <div class="flex row justify-between gap">
                        <md-button outlined @click=${() => {
                            this.isDialogShown = false;
                        }}>Cancel</md-button>

                        <div class="flex row gap">
                            <md-button outlined>Do now</md-button>
                            <md-button unelevated>Create</md-button>
                        </div>
                    </div>
                </div>
            ` : html`
                <md-fab icon="mode_edit" ?slotted=${this.isDialogShown}
                        @click=${() => {
                            this.isDialogShown = true;
                        }}></md-fab>
            `}
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopesStyles];
    }
}
