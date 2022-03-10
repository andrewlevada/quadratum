/* eslint-disable */
import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { property, query } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import scopedStyles from "./styles.module.scss";

export default (): void => defineComponent("inline-text-input", InlineTextInput);
export class InlineTextInput extends LitElement {
    @property({ type: String }) value: string = "";
    private keyUpOldValue = this.value;

    @query("p", true) paragraph!: HTMLElement;

    render(): TemplateResult {
        return html`
            <p>${this.value}</p>
            <input type="text" value=${this.value}
                   @input=${(event: InputEvent) => {
                       this.paragraph.textContent = (event.target as HTMLInputElement)!.value;
                   }}
                   @keyup=${(event: KeyboardEvent) => {
                       const value = (event.target as HTMLInputElement).value.trim();
                       if (event.key === "Backspace" && this.keyUpOldValue.length === 0) this.dispatchSimpleEvent("clear");
                       else if (event.key === "Enter") return this.dispatchSimpleEvent("update", value);
                       this.keyUpOldValue = value;
                   }}
                   @blur=${(event: MouseEvent) => {
                       const value = (event.target as HTMLInputElement).value.trim();
                       if (value.length > 0) this.dispatchSimpleEvent("update", value);
                   }}>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.keyUpOldValue = this.value;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles as never];
    }
}
