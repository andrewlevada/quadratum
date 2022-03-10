import { css, CSSResult } from "lit";
import { defineComponent } from "~utils/components";
import { Button } from "@material/mwc-button";
import "@material/mwc-button";

export default (): void => defineComponent("mwc-button-small", SmallButton);
export class SmallButton extends Button {
    static get styles(): CSSResult[] {
        return [...Button.styles, css`
          .mdc-button {
            height: 18px !important;
          }
        `];
    }
}
