import { css, CSSResult } from "lit";
import { defineComponent } from "~utils/components";
import "@material/mwc-fab";
import { Fab } from "@material/mwc-fab";

export default (): void => defineComponent("md-fab", MaterialYouFAB);
export class MaterialYouFAB extends Fab {
    static get styles(): CSSResult[] {
        return [...Fab.styles, css`
          :host {
            --mdc-theme-secondary: var(--md-sys-color-secondary-container);
            --mdc-theme-on-secondary: var(--md-sys-color-on-secondary-container);
            --mdc-icon-size: 36px;
          }

          .mdc-fab {
            height: 96px !important;
            width: 96px !important;

            border-radius: 28px !important;
          }

          .ripple {
            border-radius: 28px !important;
          }
        `];
    }
}
