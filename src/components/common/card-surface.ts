import { css, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property } from "lit/decorators.js";

export type CardSurfaceType = "filled" | "outlined";

export default (): void => defineComponent("card-surface", CardSurface);
export class CardSurface extends LitElement {
    @property({ type: String }) type?: CardSurfaceType;

    render(): TemplateResult {
        return html`
            <div class="flex col gap">
                <slot></slot>
            </div>
        `;
    }

    static styles = [...componentStyles, css`
      div {
        width: auto;
        height: fit-content;

        padding: 16px;
        border-radius: 12px;
      }

      :host([type=filled]) div {
        background-color: var(--md-sys-color-surface-variant);
      }

      :host([type=outlined]) div {
        background-color: var(--md-sys-color-surface);
        border: 1px solid var(--md-sys-color-outline);
      }

      ::slotted(*:not(:last-child)) {
        margin-bottom: 12px;
      }
    `];
}
