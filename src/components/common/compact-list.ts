import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";

export interface CompactListItem {
    label: string;
    link?: string;
    color?: string;
}

import("~components/app/router/persistent-a").then(f => f.default());

export default (): void => defineComponent("compact-list", CompactList);
export class CompactList extends LitElement {
    @property({ type: Object }) items!: CompactListItem[];
    @property({ type: String }) label?: string;

    render(): TemplateResult {
        return html`
            ${this.label ? html`<h6>${this.label}</h6>` : ""}

            <ol class="flex col">
                ${this.items.map(item => html`
                    <persistent-a class="flex row gap align-center" href=${item.link || "#"}>
                        ${item.color ? html`<span style="background: ${item.color}"></span>` : ""}
                        <p>${item.label}</p>
                    </persistent-a>
                `)}
            </ol>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          h6 {
            margin-bottom: 16px;
          }
          
          persistent-a {
            height: 30px;
            cursor: pointer;
          }
          
          span {
            width: 8px;
            height: 8px;
            border-radius: 4px;
            margin-right: 12px !important;
          }
        `];
    }
}
