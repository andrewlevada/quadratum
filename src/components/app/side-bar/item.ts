import { CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, query } from "lit/decorators.js";
import { AppRouter } from "~components/app/router/app-router";
import scopedStyles from "./styles.lit.scss";
import twemoji from "twemoji";

export interface Item {
    label: string;
    icon: string;
    link: string;
    color?: string;
    isActive?: boolean;
    isEmoji?: boolean;
}

export default (): void => defineComponent("side-bar--item", SideBarItem);
export class SideBarItem extends LitElement {
    @property({ type: String }) item!: Item;

    @query(".emoji") emojiElement: HTMLElement | undefined;

    render(): TemplateResult {
        return html`
            <a class="item ${this.item.isActive ? "active" : ""}"
               href="/app${this.item.link}"
               @click=${(event: Event) => SideBarItem.onClick(this.item, event)}>
                <span style="${this.item.color ? `color: ${this.item.color}` : ""}"
                      class=${this.item.isEmoji ? "emoji" : "material-icons"}>
                    ${this.item.icon}
                </span>
                <p>${this.item.label}</p>
            </a>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        if (this.item.isEmoji) twemoji.parse(this.emojiElement!);
    }

    private static onClick(item: Item, event: Event) {
        AppRouter.goTo(`/app${item.link}`);
        event.preventDefault();
        return false;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
