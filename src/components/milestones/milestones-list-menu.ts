import { css, html, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent, RealtimeLitElement } from "~utils/components";
import { property, query, state } from "lit/decorators.js";
import "@material/mwc-menu";
import { Menu } from "@material/mwc-menu";
import Milestone from "~src/models/milestone";

export default (): void => defineComponent("milestones-list-menu", MilestonesListMenu);
export class MilestonesListMenu extends RealtimeLitElement {
    @property({ type: Object }) selected: Milestone | null = null;
    @state() milestones: Milestone[] = [];

    @query("mwc-menu") menuElement!: Menu;

    render(): TemplateResult {
        return html`
            <mwc-menu>${this.milestones.map(v => html`
                <mwc-list-item @click=${() => {
                    this.selected = v;
                    this.dispatchSimpleEvent("change", v);
                }}>
                    <span>${v.label}</span>
                </mwc-list-item>
            `)}</mwc-menu>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        this.dataListeners.push(Milestone.listenForAll(milestones => {
            this.milestones = milestones;
        }));
    }

    public set open(value: boolean) {
        this.menuElement.open = value;
    }

    public set anchor(value: HTMLElement) {
        this.menuElement.anchor = value;
    }

    static styles = [...componentStyles, css`
      --mdc-menu-item-height: 32px;
    `];
}
