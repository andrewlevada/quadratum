import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, state } from "lit/decorators.js";
import scopedStyles from "../styles.lit.scss";
import { CompactListItem } from "~components/common/compact-list/item";

export default (): void => defineComponent("sessions-adjuster", SessionsAdjuster);
export class SessionsAdjuster extends LitElement {
    @property({ type: Number }) value!: number;

    render(): TemplateResult {
        return html`
            <div class="flex row">
                ${this.value > 0 ? html`
                    <div class="item" @click=${() => {
                        this.value--;
                        this.dispatchSimpleEvent("change", this.value);
                    }}><snap class="material-icons">remove</snap>
                    </div>
                ` : ""}
                
                <div class="item">
                    <snap class="text">${this.value}</snap>
                </div>
                
                <div class="item" @click=${() => {
                    this.value++;
                    this.dispatchSimpleEvent("change", this.value);
                }}><snap class="material-icons">remove</snap>
                </div>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
