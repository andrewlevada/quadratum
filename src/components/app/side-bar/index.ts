import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { componentStyles } from "~src/global";
import { CompactListItem } from "~components/common/compact-list";
import { defineComponent } from "~utils/components";
import "@material/mwc-drawer";
import "@material/mwc-button";
import "@material/mwc-dialog";
import "@material/mwc-textfield";
import { state } from "lit/decorators.js";
import Project from "~services/project";
import Sprint from "~services/sprint";
import { Dialog } from "@material/mwc-dialog";
import { TextField } from "@material/mwc-textfield";
import scopedStyles from "./styles.module.scss";

import("~components/common/compact-list").then(f => f.default());

export default (): void => defineComponent("side-bar", SideBar);
export class SideBar extends LitElement {
    @state() projects: Project[] = [];
    @state() sprintNumbers: [number | null, number, number] | null = null;

    render(): TemplateResult {
        return html`
            <mwc-drawer>
                <div class="flex col full-width" id="drawer-content">
                    <compact-list label="Pinned" .items=${this.pinnedCompactList()}></compact-list>
                    <compact-list label="Sprints" .items=${this.sprintsCompactList()}></compact-list>
                    <compact-list label="Projects" .items=${this.projectsToCompactList()}></compact-list>
                    <mwc-button label="Create project" icon="add" @click=${() => this.newProjectDialogState(true)}></mwc-button>
                </div>
                <div id="app-content" slot="appContent">
                    <slot></slot>
                </div>
            </mwc-drawer>

            <mwc-dialog heading="Let's do something new..." ${ref(this.newProjectDialog)}>
                <div class="flex col">
                    <mwc-textfield label="Project Name" ${ref(this.newProjectNameField)}></mwc-textfield>
                    <!-- TODO: Color picker -->
                </div>
                <mwc-button slot="primaryAction" @click=${this.createNewProject}>
                    Create
                </mwc-button>
                <mwc-button slot="secondaryAction">
                    Cancel
                </mwc-button>
            </mwc-dialog>
        `;
    }

    private newProjectDialog = createRef<Dialog>();
    private newProjectNameField = createRef<TextField>();

    private pinnedCompactList(): CompactListItem[] {
        return [
            { label: "Current Sprint", link: this.sprintNumbers ? `/sprint/${this.sprintNumbers[1]}` : "#" },
            { label: "Daily List", link: "/daily" },
        ];
    }

    private sprintsCompactList(): CompactListItem[] {
        if (!this.sprintNumbers) return [];
        const list = [
            { label: "Current", link: `/sprint/${this.sprintNumbers[1]}` },
            { label: "Next", link: `/sprint/${this.sprintNumbers[2]}` },
        ];
        if (this.sprintNumbers[0]) list.unshift({ label: "Previous", link: `/sprint/${this.sprintNumbers[0]}` });
        return list;
    }

    private projectsToCompactList(): CompactListItem[] {
        const list = this.projects.map(v => ({
            label: v.label, link: `/project/${v.id}`, color: v.color,
        } as CompactListItem));
        list.push({ label: "None", link: "/project/none", color: "#dddddd" });
        return list;
    }

    connectedCallback() {
        super.connectedCallback();
        const [lastWeekDate, nextWeekDate] = [new Date(), new Date()];
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);

        Promise.all([
            Project.all(), Sprint.current(-1), Sprint.current(), Sprint.current(1),
        ]).then(([projects, lastSprint, currentSprint, nextSprint]) => {
            this.projects = projects;
            this.sprintNumbers = [lastSprint?.number || null, currentSprint!.number, nextSprint!.number];
        });
    }

    private newProjectDialogState(newState: boolean): void {
        if (this.newProjectDialog.value) this.newProjectDialog.value.open = newState;
    }

    private createNewProject(): void {
        Project.create(this.newProjectNameField.value?.value || "Project").then(project => {
            this.newProjectDialogState(false);
            this.projects.push(project);
            this.requestUpdate();
        });
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles as never];
    }
}
