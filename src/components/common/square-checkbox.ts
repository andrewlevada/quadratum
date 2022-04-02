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
    @property({ type: String }) color: string = "var(--md-sys-color-on-surface-variant)";
    @property({ type: String }) label: string | null = null;

    render(): TemplateResult {
        return html`
            <input type="checkbox" checked=${ifDefined(this.checked || undefined)} @input=${(event: InputEvent) => {
                const input = event.target as HTMLInputElement;
                this.dispatchSimpleEvent("change", input.checked);
                if (this.label !== null) event.preventDefault();
                else this.checked = input.checked;
            }}>

            <span style=${this.checked
                    ? `background: ${this.color}; border-color: ${this.color}`
                    : (this.marked ? `border-color: ${this.color}` : "")}>
                <p>${this.label || ""}</p>
            </span>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          :host {
            width: 18px;
            height: 18px;
            position: relative;
          }
          
          :host([new-design]) span {
            border: 1px solid var(--md-sys-color-outline);
            border-radius: 4px;
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
          
          p {
            margin: 0;
            padding: 0;
            font-size: 11px;
            font-weight: 500;
            line-height: 16px;
            text-align: center;
            color: var(--md-sys-color-outline);
          }
        `];
    }
}
