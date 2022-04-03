import { css, CSSResult } from "lit";
import { defineComponent } from "~utils/components";
import { Button } from "@material/mwc-button";
import "@material/mwc-button";

export default (): void => defineComponent("md-button", MaterialYouButton);
export class MaterialYouButton extends Button {
    static get styles(): CSSResult[] {
        return [...Button.styles, css`
          .mdc-button {
            height: 40px;
            border-radius: 20px;
            padding-right: 20px;
          }
          
          .mdc-button--outlined {
            border-color: var(--md-sys-color-outline) !important;
          }

          .mdc-button__label {
            text-transform: none;
            letter-spacing: 0.1px;
            font-weight: 500;
            font-size: 14px;
            line-height: 20px;
          }
        `];
    }
}
