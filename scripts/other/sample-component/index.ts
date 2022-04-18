import { html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import scopedStyles from "./styles.lit.scss";

import(".").then(f => f.default());

export default (): void => defineComponent("tag", Component);
export class Component extends LitElement {
    render(): TemplateResult {
        return html`
            
        `;
    }

    static styles = [...componentStyles, scopedStyles];
}
