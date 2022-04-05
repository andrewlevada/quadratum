import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property } from "lit/decorators.js";
import scopedStyles from "./styles.lit.scss";

export interface CompactListItem {
    label: string;
    icon?: string;
    isEmoji?: boolean;
}

export default (): void => defineComponent("compact-list--item", CompactListItemElement);
export class CompactListItemElement extends LitElement {
    @property({ type: Object }) item!: CompactListItem;
    @property({ type: Boolean, reflect: true }) selected: boolean = false;

    render(): TemplateResult {
        return html`
            <div class="item flex row justify-start align-center">
                ${this.item.icon ? html`
                    <span class="icon ${this.item.isEmoji ? "emoji" : "material-icons"}">${this.item.icon}</span>
                ` : ""}
                
                <p>${this.item.label}</p>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
