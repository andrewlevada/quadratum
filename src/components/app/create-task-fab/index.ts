import { CSSResultGroup, html, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent, RealtimeLitElement } from "~utils/components";
import { query, state } from "lit/decorators.js";
import scopesStyles from "./styles.lit.scss";
import Scope from "~src/models/scope";
import { CompactListItem } from "~components/common/compact-list/item";
import { TextField } from "@material/mwc-textfield";
import { createTask } from "~src/models/task/factory";
import Task from "~src/models/task";

import("~components/common/selection-chip").then(f => f.default());
import("~components/common/compact-list").then(f => f.default());
import("~components/overwrites/md-fab").then(f => f.default());

export default (): void => defineComponent("create-task-fab", CreateTaskFab);
export class CreateTaskFab extends RealtimeLitElement {
    @state() isDialogShown: boolean = false;
    @state() pinnedScopes: Scope[] = [];

    private selectedScope: Scope | null = null;

    @query("#task-text-input", true) taskTextInput!: TextField;

    render(): TemplateResult {
        return html`
            ${this.isDialogShown ? html`
                <div class="surface flex col">
                    <mwc-textfield id="task-text-input" outlined
                                   label="Task name"></mwc-textfield>

                    <div class="flex row justify-between">
                        <selection-chip primary icon="outlined_flag" label="Milestone"></selection-chip>
                        <selection-chip primary icon="schedule" label="Due date"></selection-chip>
                    </div>

                    <div class="flex row justify-between">
                        <h6>Scopes</h6>
                    </div>
                    
                    <compact-list .items=${this.getScopesList()}
                                  @selectedItem=${(e: CustomEvent) => {
                        this.selectedScope = this.pinnedScopes[e.detail.value];
                    }}></compact-list>

                    <div class="flex row justify-between gap">
                        <md-button outlined @click=${() => {
                            this.isDialogShown = false;
                        }}>Cancel</md-button>

                        <div class="flex row gap">
                            <md-button outlined @click=${() => this.onCreate(true)}>Do now</md-button>
                            <md-button unelevated @click=${() => this.onCreate()}>Create</md-button>
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

    private getScopesList(): CompactListItem[] {
        return this.pinnedScopes.map(v => ({
            label: v.label,
            icon: v.symbol || "star",
            isEmoji: !!v.symbol,
        }));
    }

    connectedCallback() {
        super.connectedCallback();
        this.dataListeners.push(Scope.listenForPinned(scopes => {
            this.pinnedScopes = scopes;
        }));
    }

    private onCreate(setActive?: boolean): void {
        createTask(this.taskTextInput.value, {
            scope: {
                id: this.selectedScope?.id || "pile",
                label: this.selectedScope?.label || "Pile",
            }
        }).then(task => {
            this.isDialogShown = false;
            if (setActive) Task.setActive(task).then();
        })
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopesStyles];
    }
}
