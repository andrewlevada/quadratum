/* eslint-disable */
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import scopedStyles from "./styles.module.scss";
import "@material/mwc-icon-button";

import("~components/overwrites/mwc-button-small").then(f => f.default());

export default (): void => defineComponent("add-button", AddButton);
export class AddButton extends LitElement {
    @property({ type: String }) state: "button" | "input" = "button";
    @property({ type: Boolean }) sub: boolean = false;

    render(): TemplateResult {
        if (this.state === "button") return this.buttonStateHtml();
        if (this.state === "input") return html `
            <input class="add-input" type="text" autofocus
                   @keyup=${(event: KeyboardEvent) => {
                       if (event.key !== "Enter") return;
                       this.dispatchSimpleEvent("create", (event.target! as HTMLInputElement).value);
                       this.state = "button";
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

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles as never];
    }
}
