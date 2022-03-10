/* eslint-disable */
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { ifDefined } from "lit/directives/if-defined.js";

export default (): void => defineComponent("square-checkbox", SquareCheckbox);
export class SquareCheckbox extends LitElement {
    @property({ type: Boolean }) checked: boolean = false;

    render(): TemplateResult {
        return html`
            <input type="checkbox" checked=${ifDefined(this.checked || undefined)} @input=${(event: InputEvent) => {
                const input = event.target as HTMLInputElement;
                this.dispatchSimpleEvent("change", input.checked);
                this.checked = input.checked;
            }}>
            <span></span>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          :host {
            width: 18px;
            height: 18px;
          }
          
          span {
            display: block;
            width: 18px;
            height: 18px;
            
            border: 2px solid #000000;
            box-sizing: border-box;
            border-radius: 2px;
            
            transition: background-color 100ms ease-out;
          }
          
          input:checked + span {
            background-color: #000000;
          }

          input {
            position: absolute;
            //z-index: -1;
            opacity: 0;
          }
        `];
    }
}
