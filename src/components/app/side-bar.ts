import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import "@material/mwc-drawer";

export default (): void => defineComponent("side-bar", SideBar);
export class SideBar extends LitElement {
    render(): TemplateResult {
        return html`
            <mwc-drawer>
                <div id="drawer-content">
                    <p>Drawer Content!</p>
                </div>
                <div id="app-content" slot="appContent">
                    <slot></slot>
                </div>
            </mwc-drawer>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          #drawer-content {
            padding-left: 20px;
            padding-right: 20px;
          }
          
          #app-content {
            padding-left: 60px;
            padding-right: 60px;
          }
        `];
    }
}
