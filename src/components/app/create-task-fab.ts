import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, state } from "lit/decorators.js";
import Task from "~src/models/task";
import { setActiveTask } from "~services/user";
import { timestampToRelativeString } from "~utils/time";

import("~components/overwrites/md-fab").then(f => f.default());

export default (): void => defineComponent("create-task-fab", CreateTaskFab);
export class CreateTaskFab extends LitElement {
    @state() isDialogShown: boolean = false;

    render(): TemplateResult {
        return html`
            ${this.isDialogShown ? html`
                <div class="surface flex col gap">
                    <mwc-textfield label="Task name" outlined></mwc-textfield>

                    <div class="flex row justify-between">

                    </div>

                    <h6>Scopes</h6>

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
        return [...componentStyles, css`
          :host {
            position: fixed;
            width: 100vw;
            height: 100vh;
          }

          .surface, md-fab {
            position: fixed;
            bottom: 16px;
            right: 16px;
            z-index: 1;
          }

          .surface {
            min-width: 420px;

            background: var(--md-sys-color-secondary-container);
            color: var(--md-sys-color-on-secondary-container);

            border-radius: 28px;
            padding: 28px;
          }
        `];
    }
}
