/* eslint-disable */
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { ifDefined } from "lit/directives/if-defined.js";

export default (): void => defineComponent("square-checkbox", SquareCheckbox);
export class SquareCheckbox extends LitElement {
    @property({ type: Boolean }) checked: boolean = false;
    @property({ type: Boolean }) marked: boolean = false;
    @property({ type: String }) color: string = "#dedede";

    render(): TemplateResult {
        return html`
            <input type="checkbox" checked=${ifDefined(this.checked || undefined)} @input=${(event: InputEvent) => {
                const input = event.target as HTMLInputElement;
                this.dispatchSimpleEvent("change", input.checked);
                this.checked = input.checked;
            }}>

            <span style=${this.checked
                    ? `background: ${this.color}; border-color: ${this.color}`
                    : (this.marked ? `border-color: ${this.color}` : "")}></span>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          :host {
            width: 18px;
            height: 18px;
            position: relative;
          }
          
          span {
            display: block;
            width: 18px;
            height: 18px;
            
            border: 2px solid var(--mdc-theme-on-surface);
            box-sizing: border-box;
            border-radius: 2px;
            
            transition: background-color 100ms ease-out;
          }

          input {
            position: absolute;
            opacity: 0;
          }
        `];
    }
}
