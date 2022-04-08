import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, state } from "lit/decorators.js";
import scopedStyles from "../styles.lit.scss";
import { CompactListItem } from "~components/common/compact-list/item";

import("~components/common/square-checkbox").then(f => f.default());

export default (): void => defineComponent("sessions-adjuster", SessionsAdjuster);
export class SessionsAdjuster extends LitElement {
    @property({ type: Number }) value!: number;

    render(): TemplateResult {
        return html`
            <div class="flex row">
                ${this.value > 0 ? html`
                    <square-checkbox class="item" icon="remove" @change=${(e: Event) => {
                        e.stopPropagation();
                        this.value--;
                        this.dispatchSimpleEvent("change", this.value);
                    }} new-design></square-checkbox>
                ` : ""}

                <square-checkbox class="item" label=${this.value} new-design></square-checkbox>

                <square-checkbox class="item" icon="add" @change=${(e: Event) => {
                    e.stopPropagation();
                    this.value++;
                    this.dispatchSimpleEvent("change", this.value);
                }} new-design></square-checkbox>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
