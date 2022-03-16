import { css, CSSResult } from "lit";
import { defineComponent } from "~utils/components";
import { Drawer } from "@material/mwc-drawer";
import "@material/mwc-drawer";

export default (): void => defineComponent("mwc-drawer-fixed", DrawerFixed);
export class DrawerFixed extends Drawer {
    static get styles(): CSSResult[] {
        return [...Drawer.styles, css`
          .mdc-drawer {
            border-color: var(--mdc-theme-outline, rgba(0, 0, 0, 0.12)) !important;
          }
        `];
    }
}
