import { css, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property } from "lit/decorators.js";
import { getNiceColor, hexToNumber } from "~utils/color";
import { Slider } from "@material/mwc-slider";
import { createRef, ref } from "lit/directives/ref.js";
import "@material/mwc-slider";
import { HCT } from "@material/material-color-utilities";

export default (): void => defineComponent("color-picker", ColorPicker);
export class ColorPicker extends LitElement {
    @property({ type: String }) color?: string;

    render(): TemplateResult {
        return html`
            <div class="flex col gap">
                <div id="color-display" ${ref(this.display)}></div>
                <mwc-slider value="0" min="0" max="359" ${ref(this.slider)} @input=${() => {
                    this.updateFromHue(this.slider.value!.value);
                }}></mwc-slider>
            </div>
        `;
    }

    private display = createRef<HTMLElement>();
    private slider = createRef<Slider>();

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        if (this.color) {
            const hct = HCT.fromInt(hexToNumber(this.color));
            this.updateFromHue(hct.hue);
        }
    }

    private updateFromHue(hue: number): void {
        const color = getNiceColor(hue);
        this.display.value!.style.background = color;
        this.dispatchSimpleEvent("update", color);
    }

    static styles = [...componentStyles, css`
      #color-display {
        height: 56px;
        border-radius: var(--mdc-shape-small, 16px);
      }
    `];
}
