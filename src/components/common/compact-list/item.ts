import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, query } from "lit/decorators.js";
import scopedStyles from "./styles.lit.scss";
import twemoji from "twemoji";

export interface CompactListItem {
    label: string;
    icon?: string;
    isEmoji?: boolean;
}

export default (): void => defineComponent("compact-list--item", CompactListItemElement);
export class CompactListItemElement extends LitElement {
    @property({ type: Object }) item!: CompactListItem;
    @property({ type: Boolean, reflect: true }) selected: boolean = false;

    @query(".emoji") emojiElement: HTMLElement | undefined;

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

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        if (this.item.isEmoji) {
            twemoji.parse(this.emojiElement!);
        }
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
