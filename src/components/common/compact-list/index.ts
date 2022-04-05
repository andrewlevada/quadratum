import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, state } from "lit/decorators.js";
import scopedStyles from "./styles.lit.scss";
import { CompactListItem } from "~components/common/compact-list/item";

import("./item").then(f => f.default());

export default (): void => defineComponent("compact-list", CompactList);
export class CompactList extends LitElement {
    @property({ type: Array }) items: CompactListItem[] = [];
    @state() selectedIndex: number | null = null;

    render(): TemplateResult {
        return html`
            <div class="list flex col">
                ${this.items.map((item, i) => html`
                    <compact-list--item ?selected=${this.selectedIndex === i}
                                        .item=${item} @click=${() => {
                        this.selectedIndex = i;
                        this.dispatchSimpleEvent("selectedItem", i);
                    }}></compact-list--item>
                `)}
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
