import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import "@material/mwc-button";
import "@material/mwc-dialog";
import "@material/mwc-textfield";
import { property, state } from "lit/decorators.js";
import Project from "~services/project";
import Sprint from "~services/sprint";
import { Dialog } from "@material/mwc-dialog";
import { TextField } from "@material/mwc-textfield";
import { Item } from "~components/app/side-bar/item";
import scopedStyles from "./styles.lit.scss";

import("~components/common/color-picker").then(f => f.default());
import("./item").then(f => f.default());
import("~components/overwrites/mwc-drawer-fixed").then(f => f.default());

export default (): void => defineComponent("side-bar", SideBar);
export class SideBar extends LitElement {
    @property({ type: String }) pageTag: string = "";
    @state() projects: Project[] = [];
    @state() sprintNumbers: [number | undefined, number, number] | null = null;

    private newProjectColor: string = "";

    render(): TemplateResult {
        return html`
            <mwc-drawer-fixed>
                <div class="flex col full-width" id="drawer-content">
                    <div class="title"><p id="title-text">Quadratum</p></div>
                    ${SideBar.markActive(this.getItems()).map(item => html`
                        <side-bar--item .item=${item}></side-bar--item>
                    `)}
                    <div class="header"><p>${SideBar.isNewDesign() ? "Scopes of focus" : "Projects"}</p></div>
                    ${SideBar.markActive(this.getProjectsList()).map(item => html`
                        <side-bar--item .item=${item}></side-bar--item>
                    `)}

                    <mwc-button label="Create project" icon="add" @click=${() => this.newProjectDialogState(true)}></mwc-button>
                </div>
                <div id="app-content" slot="appContent">
                    <slot></slot>
                </div>
            </mwc-drawer-fixed>

            <mwc-dialog heading="Let's do something new..." ${ref(this.newProjectDialog)}>
                <div class="flex col gap">
                    <mwc-textfield label="Project Label" ${ref(this.newProjectNameField)}></mwc-textfield>
                    <color-picker @update=${(e: CustomEvent) => {
                        this.newProjectColor = e.detail.value as string;
                    }}></color-picker>
                </div>
                <mwc-button slot="primaryAction" @click=${this.createNewProject}>
                    Create
                </mwc-button>
                <mwc-button slot="secondaryAction" @click=${() => this.newProjectDialogState(false)}>
                    Cancel
                </mwc-button>
            </mwc-dialog>
        `;
    }

    private newProjectDialog = createRef<Dialog>();
    private newProjectNameField = createRef<TextField>();

    private getProjectsList(): Item[] {
        const list = this.projects.map(v => ({
            label: v.label, link: `/project/${v.id}`, color: v.color, icon: "star",
        } as Item));
        list.push({ label: "None", link: "/project/none", color: "#dddddd", icon: "star" });
        return list;
    }

    private getItems(): Item[] {
        if (SideBar.isNewDesign()) return [
            { icon: "home", label: "Home", link: "" },
            { icon: "account_tree", label: "Life Map", link: "/map" },
            { icon: "flag", label: "Milestones", link: "/milestones" },
        ];
        if (!this.sprintNumbers) return [];
        return [
            { icon: "filter_center_focus", label: "Daily List", link: "/daily" },
            { icon: "all_inclusive", label: "Current Sprint", link: `/sprint/${this.sprintNumbers[1]}` },
            { icon: "skip_previous", label: "Last Sprint", link: `/sprint/${this.sprintNumbers[0]}` },
            { icon: "skip_next", label: "Next Sprint", link: `/sprint/${this.sprintNumbers[2]}` },
        ];
    }

    private static markActive(items: Item[]): Item[] {
        const path = window.location.pathname;
        return items.map(v => ({ ...v, isActive: path === `/app${v.link}` }));
    }

    connectedCallback() {
        super.connectedCallback();
        if (SideBar.isNewDesign()) return;
        const [lastWeekDate, nextWeekDate] = [new Date(), new Date()];
        lastWeekDate.setDate(lastWeekDate.getDate() - 7);
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);

        Promise.all([
            Project.all(), Sprint.current(-1), Sprint.current(), Sprint.current(1),
        ]).then(([projects, lastSprint, currentSprint, nextSprint]) => {
            this.projects = projects;
            this.sprintNumbers = [lastSprint?.number, currentSprint!.number, nextSprint!.number];
        });
    }

    private newProjectDialogState(newState: boolean): void {
        if (this.newProjectDialog.value) this.newProjectDialog.value.open = newState;
    }

    private createNewProject(): void {
        Project.create(this.newProjectNameField.value?.value || "Project", this.newProjectColor).then(project => {
            this.newProjectDialogState(false);
            this.projects.push(project);
            this.requestUpdate();
        });
    }

    private static isNewDesign(): boolean {
        return !!localStorage.getItem("qu-new-design");
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
