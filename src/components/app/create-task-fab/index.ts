import { CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent, RealtimeLitElement } from "~utils/components";
import { query, state } from "lit/decorators.js";
import scopesStyles from "./styles.lit.scss";
import Scope from "~src/models/scope";
import { CompactListItem } from "~components/common/compact-list/item";
import { TextField } from "@material/mwc-textfield";
import { createTask } from "~src/models/task/factory";
import Task from "~src/models/task";
import { DatePicker } from "~components/overwrites/date-picker";
import { dateToDisplayString } from "~utils/time";
import "@material/mwc-menu";
import { Menu } from "@material/mwc-menu";

import("~components/common/selection-chip").then(f => f.default());
import("~components/common/compact-list").then(f => f.default());
import("~components/overwrites/md-fab").then(f => f.default());
import("~components/overwrites/md-button").then(f => f.default());
import("~components/overwrites/date-picker").then(f => f.default());

export default (): void => defineComponent("create-task-fab", CreateTaskFab);
export class CreateTaskFab extends RealtimeLitElement {
    @state() isDialogShown: boolean = false;
    @state() pinnedScopes: Scope[] = [];
    @state() dueDate: Date | null = null;
    @state() allScopes: Scope[] = [];
    @state() selectedScope: Scope | null = null;

    @query("#task-text-input") taskTextInput!: TextField;
    @query("date-picker") datePickerElement!: DatePicker;
    @query(".more-scopes-button") moreScopesButton!: HTMLElement;
    @query("mwc-menu") scopesMenuElement!: Menu;

    render(): TemplateResult {
        return html`
            ${this.isDialogShown ? html`
                <div class="surface flex col">
                    <mwc-textfield id="task-text-input" outlined
                                   label="Task name"></mwc-textfield>

                    <div class="flex row justify-between">
                        <selection-chip primary icon="outlined_flag" label="Milestone"></selection-chip>

                        <date-picker @change=${() => {
                            this.dueDate = this.datePickerElement.getSelectedDates()[0];
                            this.dueDate.setHours(23, 59, 59, 999);
                        }}>
                            <selection-chip label=${this.dueDate ? dateToDisplayString(this.dueDate) : "Due date"}
                                            primary icon="schedule"></selection-chip>
                        </date-picker>
                    </div>

                    <div class="scopes-heading flex row align-center justify-between">
                        <h6>Scopes</h6>
                        <div>
                            <md-button class="more-scopes-button" label=${this.getScopesMenuLabel()}
                                       icon="expand_circle_down" trailingIcon @click=${() => {
                                this.scopesMenuElement.open = true;
                            }}></md-button>

                            <mwc-menu>${this.getScopesMenuTemplate()}</mwc-menu>
                        </div>
                    </div>

                    <compact-list .items=${this.getPinnedScopesList()}
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
                            if (this.allScopes.length === 0 && this.dataListeners.length === 1)
                                this.dataListeners.push(Scope.listen(scopes => {
                                    this.allScopes = scopes;
                                }));
                        }}></md-fab>
            `}
        `;
    }

    private getScopesMenuLabel(): string {
        if (!this.selectedScope || this.pinnedScopes.includes(this.selectedScope)) return "View full list";
        return `${this.selectedScope.symbol ? `${this.selectedScope.symbol} ` : ""}${this.selectedScope.label}`;
    }

    private getPinnedScopesList(): CompactListItem[] {
        return this.pinnedScopes.map(v => ({
            label: v.label,
            icon: v.symbol || "star",
            isEmoji: !!v.symbol,
        }));
    }

    private getScopesMenuTemplate(): TemplateResult[] {
        return this.allScopes.map(v => html`
            <mwc-list-item @click=${() => {
                this.selectedScope = v;
            }}>
                <span>${v.symbol ? `${v.symbol} ` : ""}${v.label}</span>
            </mwc-list-item>
        `);
    }

    connectedCallback() {
        super.connectedCallback();
        this.dataListeners.push(Scope.listenForPinned(scopes => {
            this.pinnedScopes = scopes;
        }));
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (this.isDialogShown && _changedProperties.has("isDialogShown")) {
            setTimeout(() => {
                this.taskTextInput.focus();
                this.scopesMenuElement.anchor = this.moreScopesButton;
            }, 0);
        }
    }

    private onCreate(setActive?: boolean): void {
        createTask(this.taskTextInput.value, {
            scope: {
                id: this.selectedScope?.id || "pile",
                label: this.selectedScope?.label || "Pile",
            },
            dueDate: this.dueDate || undefined,
        }).then(task => {
            if (setActive) Task.setActive(task).then();
            this.isDialogShown = false;
            this.dueDate = null;
            this.selectedScope = null;
        })
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopesStyles];
    }
}
