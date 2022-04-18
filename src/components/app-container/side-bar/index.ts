import { html, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent, RealtimeLitElement } from "~utils/components";
import { property, state } from "lit/decorators.js";
import { Item } from "~components/app-container/side-bar/item";
import scopedStyles from "./styles.lit.scss";
import Scope from "~src/models/scope";

import("~components/overwrites/mwc-drawer-fixed").then(f => f.default());
import("./item").then(f => f.default());

export default (): void => defineComponent("side-bar", SideBar);
export class SideBar extends RealtimeLitElement {
    @property({ type: String }) pageTag: string = "";
    @state() pinnedScopes: Scope[] = [];
    @state() scopes: Scope[] = [];
    @state() showAllScopes: boolean = false;

    render(): TemplateResult {
        return html`
            <mwc-drawer-fixed>
                <div class="flex col full-width" id="drawer-content">
                    <div class="title"><p id="title-text">Quadratum</p></div>
                    ${SideBar.markActive(SideBar.getItems()).map(item => html`
                        <side-bar--item .item=${item}></side-bar--item>
                    `)}

                    <div class="header"><p>Scopes of focus</p></div>
                    ${SideBar.markActive(this.getScopes()).map(item => html`
                        <side-bar--item .item=${item}></side-bar--item>
                    `)}
                </div>

                <div id="app-content" slot="appContent">
                    <slot></slot>
                </div>
            </mwc-drawer-fixed>
        `;
    }

    private getScopes(): Item[] {
        const s = this.showAllScopes ? this.scopes : this.pinnedScopes;
        const items = s.map(v => ({
            label: v.label,
            icon: v.symbol || "star",
            link: `/scope/${v.id}`,
            isEmoji: !!v.symbol,
        } as Item));

        items.unshift({
            label: "Pile",
            icon: "inbox",
            link: "/scope/pile",
        });

        if (this.showAllScopes) {
            items.push({
                label: "Hide some scopes",
                icon: "expand_less",
                link: "#",
                onClick: () => {
                    this.showAllScopes = false;
                }
            });
        } else {
            items.push({
                label: "Show all scopes",
                icon: "expand_more",
                link: "#",
                onClick: () => {
                    this.showAllScopes = true;
                }
            });
        }

        return items;
    }

    private static getItems(): Item[] {
        return [
            { icon: "home", label: "Home", link: "" },
            { icon: "account_tree", label: "Life Map", link: "/map" },
            { icon: "flag", label: "Milestones", link: "/milestones" },
        ];
    }

    private static markActive(items: Item[]): Item[] {
        const path = window.location.pathname;
        return items.map(v => ({ ...v, isActive: path === `/app${v.link}` }));
    }

    connectedCallback() {
        super.connectedCallback();
        this.dataListeners.push(Scope.listenForAll((scopes: Scope[]) => {
            this.scopes = scopes;
            this.pinnedScopes = scopes.filter(v => v.isPinned);
        }));
    }

    static styles = [...componentStyles, scopedStyles];
}
