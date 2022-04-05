import { css, CSSResult } from "lit";
import { defineComponent } from "~utils/components";
import { LitFlatpickr } from "lit-flatpickr";

export default (): void => defineComponent("date-picker", DatePicker);
export class DatePicker extends LitFlatpickr {
    connectedCallback() {
        super.connectedCallback();
        this.onChange = () => {
            this.dispatchSimpleEvent("change");
        };
    }

    static get styles(): CSSResult[] {
        return [...LitFlatpickr.styles, css`
          :host {
            background-color: initial;
          }
        `];
    }
}
