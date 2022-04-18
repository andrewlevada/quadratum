import { html, LitElement, TemplateResult } from "lit";
import { defineComponent } from "~utils/components";
import { componentStyles } from "~src/global";
import { query, state } from "lit/decorators.js";
import { createMilestone } from "~src/models/milestone/factory";
import "@material/mwc-textfield";
import { CalendarInput } from "~components/common/calendar-input";

import("~components/overwrites/md-button").then(f => f.default());
import("~components/common/calendar-input").then(f => f.default());

export default (): void => defineComponent("milestone-create-form", MilestoneCreateForm);
export class MilestoneCreateForm extends LitElement {
    @state() name: string | null = null;
    @state() description: string | null = null;
    @state() dueDate: number | null = null;

    @query("calendar-input") calendarInput!: CalendarInput;

    render(): TemplateResult {
        return html`
            <div class="flex col gap">
                <mwc-textfield label="Label" @change=${bind(this, "name")} required outlined></mwc-textfield>
                <mwc-textfield label="Description" @change=${bind(this, "description")} outlined></mwc-textfield>
                <mwc-textfield label="Due date" outlined .value=${this.dueDate} @click=${(e: MouseEvent) => {
                    this.calendarInput.anchor = e.target as HTMLElement;
                    this.calendarInput.open();
                }}></mwc-textfield>

                <calendar-input @change=${() => {
                    const date = this.calendarInput.date;
                    date.setHours(24)
                    this.dueDate = date.getTime();
                }}></calendar-input>

                <md-button label="Create" unelevated @click=${() => {
                    if (!this.name || !this.dueDate) return;
                    createMilestone({
                        label: this.name,
                        description: this.description || "",
                        dueDate: this.dueDate,
                    }).then(() => {
                        this.dispatchSimpleEvent("created");
                    })
                }}></md-button>
            </div>
        `;
    }

    static styles = [...componentStyles];
}

function bind<T>(this_: T, property: keyof T) {
    return (e: CustomEvent) => {
        const value = (e.target as any)?.value || e.detail.value;
        if (!value) console.error("Can not get value from event bind!", e);
        else this_[property] = value;
    }
}
