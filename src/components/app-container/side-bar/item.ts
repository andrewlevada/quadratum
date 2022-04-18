import { html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, query } from "lit/decorators.js";
import { AppRouter } from "~components/app-container/router/app-router";
import scopedStyles from "./styles.lit.scss";

export interface Item {
    label: string;
    icon: string;
    link: string;
    color?: string;
    isActive?: boolean;
    isEmoji?: boolean;
    onClick?: ()=>void;
}

export default (): void => defineComponent("side-bar--item", SideBarItem);
export class SideBarItem extends LitElement {
    @property({ type: Object }) item!: Item;

    @query(".emoji") emojiElement: HTMLElement | undefined;

    render(): TemplateResult {
        return html`
            <a class="item ${this.item.isActive ? "active" : ""}"
               href="/app${this.item.link}"
               @click=${(event: Event) => {
                   if (this.item.onClick) {
                       event.preventDefault();
                       this.item.onClick();
                   } else SideBarItem.onClick(this.item, event);
               }}>
                <div class="icon-container flex align-center justify-center">
                    <span style="${this.item.color ? `color: ${this.item.color}` : ""}"
                          class=${this.item.isEmoji ? "emoji" : "material-icons"}>
                    ${this.item.icon}
                    </span>
                </div>
                <p>${this.item.label}</p>
            </a>
        `;
    }

    private static onClick(item: Item, event: Event) {
        AppRouter.goTo(`/app${item.link}`);
        event.preventDefault();
        return false;
    }

    static styles = [...componentStyles, scopedStyles];
}
