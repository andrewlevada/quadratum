import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, query } from "lit/decorators.js";
import { Scheme } from "@material/material-color-utilities";
import { numberToHex } from "~utils/color";

export default (): void => defineComponent("color-chip", ColorChip);
export class ColorChip extends LitElement {
    @property({ type: String }) color!: string;

    render(): TemplateResult {
        return html`
            <div class="flex justify-center align-center">
                <p><slot></slot></p>
            </div>
        `;
    }

    @query("div", true) div!: HTMLElement;
    @query("p", true) p!: HTMLElement;

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        if (this.color !== "#dedede") {
            const scheme = Scheme.light(Number.parseInt(this.color.substring(1), 16));
            this.div.style.background = numberToHex(scheme.primaryContainer);
            this.p.style.color = numberToHex(scheme.onPrimaryContainer);
        } else {
            this.div.style.background = this.color;
            this.p.style.color = "#111111";
        }
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          :host {
            display: flex;
            flex-direction: row;
            align-items: center;
          }
          
          div {
            width: fit-content;
            height: 32px;
            
            padding-left: 16px;
            padding-right: 16px;
            
            border-radius: 8px;
          }
          
          p {
            font-size: 15px;
          }
        `];
    }
}
