import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import scopedStyles from "./styles.module.scss";
import "@material/mwc-drawer";
import { CompactListItem } from "~components/common/compact-list";

import("~components/common/compact-list").then(f => f.default());

export default (): void => defineComponent("side-bar", SideBar);
export class SideBar extends LitElement {
    private static nowList: CompactListItem[] = [
        { label: "Current Sprint", link: "/sprint/0" },
        { label: "Daily List", link: "/daily" },
    ]

    private static sprintsList: CompactListItem[] = [
        { label: "Previous", link: "/sprint/0" },
        { label: "Current", link: "/sprint/0" },
        { label: "Next", link: "/sprint/0" },
    ]

    render(): TemplateResult {
        return html`
            <mwc-drawer>
                <div class="flex col full-width" id="drawer-content">
                    <compact-list label="Pinned" .items=${SideBar.nowList}></compact-list>
                    <compact-list label="Sprints" .items=${SideBar.sprintsList}></compact-list>
                    <compact-list label="Projects" .items=${[]}></compact-list>
                </div>
                <div id="app-content" slot="appContent">
                    <slot></slot>
                </div>
            </mwc-drawer>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles as never];
    }
}
