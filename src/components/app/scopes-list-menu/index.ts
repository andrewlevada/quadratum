import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent, RealtimeLitElement } from "~utils/components";
import { property, query, state } from "lit/decorators.js";
import Scope from "~src/models/scope";
import "@material/mwc-menu";
import { Menu } from "@material/mwc-menu";

export default (): void => defineComponent("scopes-list-menu", ScopesListMenu);
export class ScopesListMenu extends RealtimeLitElement {
    @property({ type: Object }) selectedScope: Scope | null = null;
    @state() scopes: Scope[] = [];

    @query("mwc-menu") scopesMenuElement!: Menu;

    render(): TemplateResult {
        return html`
            <mwc-menu>${this.scopes.map(v => html`
                <mwc-list-item @click=${() => {
                    this.selectedScope = v;
                    this.dispatchSimpleEvent("change", v);
                }}>
                    <span>${v.symbol ? `${v.symbol} ` : ""}${v.label}</span>
                </mwc-list-item>
            `)}</mwc-menu>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        this.dataListeners.push(Scope.listen(scopes => {
            this.scopes = scopes;
        }));
    }

    public set open(value: boolean) {
        this.scopesMenuElement.open = value;
    }

    public set anchor(value: HTMLElement) {
        this.scopesMenuElement.anchor = value;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          --mdc-menu-item-height: 32px;
        `];
    }
}
