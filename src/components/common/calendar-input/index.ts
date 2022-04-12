import { defineComponent, waitForRender } from "~utils/components";
import { css, html, LitElement } from "lit";
import { property, state, query  } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { getDate, getMonth, getYear, setDate, setMonth, setYear } from "date-fns";
import { hasChangedISO, ISOConverter } from "~utils/time";
import "@material/mwc-menu";
import { Menu } from "@material/mwc-menu";

import("./table").then(f => f.default());

export default (): void => defineComponent("calendar-input", CalendarInput);
export class CalendarInput extends LitElement {
    @property({ converter: ISOConverter, hasChanged: hasChangedISO }) value?: Date;

    @state({ hasChanged: hasChangedISO }) private tempValue: Date = new Date();

    @query("mwc-menu") menu!: Menu;

    protected render(): unknown {
        return html`
            <mwc-menu>
                <calendar-input--table
                        .value=${this.date}
                        @input=${this.onCalendarInput}
                ></calendar-input--table>
            </mwc-menu>
        `;
    }

    public get date(): Date {
        return this.tempValue || this.value || new Date();
    }

    public set anchor(value: HTMLElement) {
        this.menu.anchor = value;
    }

    public open() {
        this.menu.open = true;
    }

    onCalendarInput({ detail: date }: CustomEvent<Date>) {
        this.tempValue = setDate(this.tempValue, getDate(date));
        this.tempValue = setMonth(this.tempValue, getMonth(date));
        this.tempValue = setYear(this.tempValue, getYear(date));
        this.dispatchSimpleEvent("change");
    }

    static styles = [...componentStyles, css`
      :host {
        position: relative;
        --mdc-theme-surface: var(--md-sys-color-surface);
      }
      
      :host, .container {
        width: 400px;
        color: var(--md-sys-color-on-surface)
      }
    `];
}
