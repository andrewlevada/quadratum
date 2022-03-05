import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { CompactListItem } from "~components/common/compact-list";
import { defineComponent } from "~utils/components";
import { getSprintIdFromDate } from "~services/sprints-service";
import "@material/mwc-drawer";
import { state } from "lit/decorators.js";
import Project from "~services/project/view-model";
import { getAllProjects } from "~services/project/factory";
import scopedStyles from "./styles.module.scss";

import("~components/common/compact-list").then(f => f.default());

export default (): void => defineComponent("side-bar", SideBar);
export class SideBar extends LitElement {
    @state() projects: Project[] = [];
    @state() sprintIds: [string, string, string] | null = null;

    render(): TemplateResult {
        return html`
            <mwc-drawer>
                <div class="flex col full-width" id="drawer-content">
                    <compact-list label="Pinned" .items=${this.pinnedCompactList()}></compact-list>
                    <compact-list label="Sprints" .items=${this.sprintsCompactList()}></compact-list>
                    <compact-list label="Projects" .items=${this.projectsToCompactList()}></compact-list>
                </div>
                <div id="app-content" slot="appContent">
                    <slot></slot>
                </div>
            </mwc-drawer>
        `;
    }

    private pinnedCompactList(): CompactListItem[] {
        return [
            { label: "Current Sprint", link: this.sprintIds ? `/sprint/${this.sprintIds[1]}` : "#" },
            { label: "Daily List", link: "/daily" },
        ];
    }

    private sprintsCompactList(): CompactListItem[] {
        if (!this.sprintIds) return [];
        return [
            { label: "Previous", link: `/sprint/${this.sprintIds[0]}` },
            { label: "Current", link: `/sprint/${this.sprintIds[1]}` },
            { label: "Next", link: `/sprint/${this.sprintIds[2]}` },
        ];
    }

    private projectsToCompactList(): CompactListItem[] {
        return this.projects.map(v => ({
            label: v.label, link: `/project/${v.id}`, color: v.color,
        } as CompactListItem));
    }

    connectedCallback() {
        super.connectedCallback();
        const [lastWeekDate, nextWeekDate] = [new Date(), new Date()];
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);

        Promise.all([
            getAllProjects(),
            getSprintIdFromDate(lastWeekDate),
            getSprintIdFromDate(new Date()),
            getSprintIdFromDate(nextWeekDate),
        ]).then(([projects, lastSprintId, currentSprintId, nextSprintId]) => {
            this.projects = projects;
            this.sprintIds = [lastSprintId, currentSprintId, nextSprintId];
        });
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles as never];
    }
}
