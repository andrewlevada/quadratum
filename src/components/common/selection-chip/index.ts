import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property } from "lit/decorators.js";
import scopedStyles from "./styles.lit.scss";

export default (): void => defineComponent("selection-chip", SelectionChip);
export class SelectionChip extends LitElement {
    @property({ type: String }) label!: string;
    @property({ type: String }) icon: string | null = null;
    @property({ type: Boolean, reflect: true }) selected: boolean = false;
    @property({ type: Boolean }) primary: boolean = false;

    render(): TemplateResult {
        return html`
            <div class="chip flex row align-center"
                 @click=${() => { this.selected = true; }}>
                ${this.icon ? html`
                    <span class="icon material-icons">${this.icon}</span>
                ` : ""}
                
                <p>${this.label}</p>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
