import { html, PropertyValues, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent, RealtimeLitElement } from "~utils/components";
import { query, state } from "lit/decorators.js";
import scopesStyles from "./styles.lit.scss";
import Scope from "~src/models/scope";
import { CompactListItem } from "~components/common/compact-list/item";
import { TextField } from "@material/mwc-textfield";
import { createTask, CreationContext } from "~src/models/task/factory";
import Task from "~src/models/task";
import { dateToDisplayString } from "~utils/time";
import { ScopesListMenu } from "~components/app/scopes-list-menu";
import { CalendarInput } from "~components/common/calendar-input";
import "@material/mwc-textfield";

import("~components/common/selection-chip").then(f => f.default());
import("~components/common/compact-list").then(f => f.default());
import("~components/app/scopes-list-menu").then(f => f.default());
import("~components/overwrites/md-fab").then(f => f.default());
import("~components/overwrites/md-button").then(f => f.default());
import("~components/common/calendar-input").then(f => f.default());

export default (): void => defineComponent("create-task-fab", CreateTaskFab);
export class CreateTaskFab extends RealtimeLitElement {
    @state() isDialogShown: boolean = false;
    @state() pinnedScopes: Scope[] = [];
    @state() dueDate: Date | null = null;
    @state() allScopes: Scope[] = [];
    @state() selectedScope: Scope | null = null;

    @query("#task-text-input") taskTextInput!: TextField;
    @query("calendar-input") calendarInputElement!: CalendarInput;
    @query(".more-scopes-button") moreScopesButton!: HTMLElement;
    @query("scopes-list-menu") scopesMenuElement!: ScopesListMenu;

    render(): TemplateResult {
        return html`
            ${this.isDialogShown ? html`
                <div class="surface flex col">
                    <mwc-textfield id="task-text-input" outlined
                                   label="Task name"></mwc-textfield>

                    <div class="flex row justify-between">
                        <selection-chip primary icon="outlined_flag" label="Milestone"></selection-chip>

                        <div>
                            <selection-chip label=${this.dueDate ? dateToDisplayString(this.dueDate) : "Due date"}
                                            primary icon="schedule" @click=${(e: Event) => {
                                this.calendarInputElement.anchor = e.target as HTMLElement;
                                this.calendarInputElement.open();
                            }}></selection-chip>

                            <calendar-input @change=${() => {
                                this.dueDate = this.calendarInputElement.date;
                                this.dueDate.setHours(23, 59, 59, 999);
                            }}></calendar-input>
                        </div>
                    </div>

                    <div class="scopes-heading flex row align-center justify-between">
                        <h6>Scopes</h6>
                        <div>
                            <md-button class="more-scopes-button" label=${this.getScopesMenuLabel()}
                                       icon="expand_circle_down" trailingIcon @click=${() => {
                                this.scopesMenuElement.open = true;
                            }}></md-button>

                            <scopes-list-menu .selectedScope=${this.selectedScope} @change=${() => {
                                this.selectedScope = this.scopesMenuElement.selectedScope;
                            }}></scopes-list-menu>
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
                                this.dataListeners.push(Scope.listenForAll(scopes => {
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
        const payload = {
            scope: {
                id: this.selectedScope?.id || "pile",
                label: this.selectedScope?.label || "Pile",
            }
        } as CreationContext;
        if (this.dueDate) payload.dueDate = this.dueDate;

        createTask(this.taskTextInput.value, payload).then(task => {
            if (setActive) Task.setActive(task).then();
            this.isDialogShown = false;
            this.dueDate = null;
            this.selectedScope = null;
        })
    }

    static styles = [...componentStyles, scopesStyles];
}
