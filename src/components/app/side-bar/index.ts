import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { componentStyles } from "~src/global";
import { CompactListItem } from "~components/common/compact-list";
import { defineComponent } from "~utils/components";
import "@material/mwc-button";
import "@material/mwc-dialog";
import "@material/mwc-textfield";
import { property, state } from "lit/decorators.js";
import Project from "~services/project";
import Sprint from "~services/sprint";
import { Dialog } from "@material/mwc-dialog";
import { TextField } from "@material/mwc-textfield";
import { AppRouter } from "~components/app/router/app-router";
import scopedStyles from "./styles.lit.scss";

import("~components/common/color-picker").then(f => f.default());
import("~components/common/compact-list").then(f => f.default());
import("~components/overwrites/mwc-drawer-fixed").then(f => f.default());

interface Item {
    label: string;
    icon: string;
    link: string;
    color?: string;
}

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
                    <div><p id="title-text">Quadratum</p></div>
                    ${this.getItems().map(item => html`
                        <a class="item ${SideBar.isActive(item) ? "active" : ""}"
                           href="/app${item.link}" @click=${(event: Event) => SideBar.onClick(item, event)}>
                            <span class="material-icons">${item.icon}</span>
                            <p>${item.label}</p>
                        </a>
                    `)}
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
        if (this.sprintNumbers[0] !== undefined) list.unshift({ label: "Previous", link: `/sprint/${this.sprintNumbers[0]}` });
        return list;
    }

    private projectsToCompactList(): CompactListItem[] {
        const list = this.projects.map(v => ({
            label: v.label, link: `/project/${v.id}`, color: v.color,
        } as CompactListItem));
        list.push({ label: "None", link: "/project/none", color: "#dddddd" });
        return list;
    }

    private getItems(): Item[] {
        if (localStorage.getItem("qu-new-design")) return [
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

    private static isActive(item: Item): boolean {
        return window.location.pathname === `/app${item.link}`;
    }

    private static onClick(item: Item, event: Event) {
        AppRouter.goTo(`/app${item.link}`);
        event.preventDefault();
        return false;
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

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles];
    }
}
