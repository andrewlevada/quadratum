import { defineComponent } from "~utils/components";
import { css, html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { getDate, getMonth, getYear, setDate, setMonth, setYear } from "date-fns";
import { hasChangedISO, ISOConverter } from "~utils/time";

export default (): void => defineComponent("calendar-input", CalendarInput);
export class CalendarInput extends LitElement {
    @property({ converter: ISOConverter, hasChanged: hasChangedISO }) value?: Date;

    @state({ hasChanged: hasChangedISO }) private tempValue: Date = new Date();

    public get selected(): Date {
        return this.tempValue || this.value || new Date();
    }

    onCalendarInput({ detail: date }: CustomEvent<Date>) {
        this.tempValue = setDate(this.tempValue, getDate(date));
        this.tempValue = setMonth(this.tempValue, getMonth(date));
        this.tempValue = setYear(this.tempValue, getYear(date));
        this.dispatchSimpleEvent("change");
    }

    protected render(): unknown {
        return html`
            <lit-datetime-picker-calendar
                .value=${this.selected}
                @input=${this.onCalendarInput}
            ></lit-datetime-picker-calendar>`;
    }

    static styles = [...componentStyles, css`
      :host, .container {
        width: 400px;
        color: var(--md-sys-color-on-surface)
      }
    `];
}
