import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";

export interface CompactListItem {
    label: string;
    link?: string;
    color?: string;
}

export default (): void => defineComponent("compact-list", CompactList);
export class CompactList extends LitElement {
    @property({ type: Object }) items!: CompactListItem[];
    @property({ type: String }) label?: string;

    render(): TemplateResult {
        return html`
            ${this.label ? html`<h6>${this.label}</h6>` : ""}

            <ol class="flex col">
                ${this.items.map(item => html`
                    <li class="flex row align-center">
                        <p>${item.label}</p>
                    </li>
                `)}
            </ol>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          h6 {
            margin-bottom: 16px;
          }
          
          li {
            height: 30px;
            cursor: pointer;
          }
        `];
    }
}
