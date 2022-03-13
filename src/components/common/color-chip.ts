import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";

export default (): void => defineComponent("color-chip", ColorChip);
export class ColorChip extends LitElement {
    render(): TemplateResult {
        return html`
            <div class="flex justify-center align-center">
                <p><slot></slot></p>
            </div>
        `;
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
            
            background-color: aquamarine;
            border-radius: 8px;
          }
          
          p {
            font-size: 15px;
          }
        `];
    }
}
