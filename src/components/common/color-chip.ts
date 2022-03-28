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

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        const color = Number.parseInt(this.color.substring(1), 16);
        const scheme = ColorChip.isDark() ? Scheme.dark(color) : Scheme.light(color);
        this.div.style.background = numberToHex(scheme.primaryContainer);
        this.p.style.color = numberToHex(scheme.onPrimaryContainer);
    }

    private static isDark() {
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
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
