/* eslint-disable */
import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult, unsafeCSS } from "lit";
import { property, query } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import scopedStyles from "./styles.module.scss";
import "@material/mwc-icon-button";

import("~components/overwrites/mwc-button-small").then(f => f.default());

export default (): void => defineComponent("add-button", AddButton);
export class AddButton extends LitElement {
    @property({ type: String }) state: "button" | "input" = "button";
    @property({ type: Boolean }) sub: boolean = false;
    private keyUpOldValue = "";

    @query("input") input!: HTMLInputElement;

    render(): TemplateResult {
        if (this.state === "button") return this.buttonStateHtml();
        if (this.state === "input") return html `
            <input class="add-input" type="text"
                   @keyup=${(event: KeyboardEvent) => {
                       if (event.key === "Backspace" && this.keyUpOldValue.length === 0) this.state = "button";
                       if (event.key === "Enter") {
                           this.dispatchSimpleEvent("create", (event.target! as HTMLInputElement).value);
                           this.state = "button";
                       }
                       this.keyUpOldValue = this.input.value;
                   }}
                   @blur=${() => {
                       if (this.input.value.length === 0) this.state = "button";
                   }}>
        `;

        throw new Error("Invalid state value in task-table/add-button");
    }

    private buttonStateHtml(): TemplateResult {
        if (this.sub) return html`
            <mwc-icon-button icon="add" @click=${() => {
                this.state = "input";
            }}></mwc-icon-button>
        `;

        return html`
            <mwc-button-small label="Create task" icon="add"
                              @click=${() => {
                                  this.state = "input";
                              }}></mwc-button-small>
        `;
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (this.input) this.input.focus();
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, unsafeCSS(scopedStyles)];
    }
}
