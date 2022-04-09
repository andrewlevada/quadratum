import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { property, query } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { Menu } from "@material/mwc-menu";
import "@material/mwc-icon-button";
import "@material/mwc-menu";

export default (): void => defineComponent("menu-tiny-button", MenuTinyButton);
export class MenuTinyButton extends LitElement {
    @property({ type: String }) icon!: string;

    @query(".actions-menu") actionsMenu!: Menu;
    @query(".actions-button") actionsButton!: HTMLElement;

    render(): TemplateResult {
        return html`
            <mwc-icon-button class="actions-button" icon=${this.icon} @click=${() => {
                this.actionsMenu.open = true;
            }}></mwc-icon-button>

            <mwc-menu class="actions-menu">
                <slot></slot>
            </mwc-menu>
        `;
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.actionsMenu.anchor = this.actionsButton;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          :host {
            position: relative;
            width: 18px;
            height: 18px;

            --mdc-icon-button-size: 24px;
            --mdc-icon-size: 18px;
          }
          
          .actions-button {
            opacity: 0;
          }

          .actions-button:hover {
            opacity: 1;
          }
        `];
    }
}
