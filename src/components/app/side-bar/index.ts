import { CSSResultGroup, html, TemplateResult } from "lit";
import { createRef, ref } from "lit/directives/ref.js";
import { componentStyles, isNewDesign } from "~src/global";
import { defineComponent, RealtimeLitElement } from "~utils/components";
import "@material/mwc-button";
import "@material/mwc-dialog";
import "@material/mwc-textfield";
import { property, state } from "lit/decorators.js";
import Project from "~src/models/legacy/project";
import Sprint from "~src/models/legacy/sprint";
import { Dialog } from "@material/mwc-dialog";
import { TextField } from "@material/mwc-textfield";
import { Item } from "~components/app/side-bar/item";
import scopedStyles from "./styles.lit.scss";
import Scope from "~src/models/scope";

import("~components/common/color-picker").then(f => f.default());
import("~components/overwrites/mwc-drawer-fixed").then(f => f.default());
import("./item").then(f => f.default());

export default (): void => defineComponent("side-bar", SideBar);
export class SideBar extends RealtimeLitElement {
    @property({ type: String }) pageTag: string = "";
    @state() pinnedScopes: Scope[] = [];
    @state() scopes: Scope[] = [];
    @state() showAllScopes: boolean = false;

    // Legacy
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
                    <div class="header"><p>${isNewDesign() ? "Scopes of focus" : "Projects"}</p></div>
                    ${SideBar.markActive(this.getDynamicList()).map(item => html`
                        <side-bar--item .item=${item}></side-bar--item>
                    `)}
                    
                    ${!isNewDesign() ? html`
                        <mwc-button label="Create project" icon="add"
                                    @click=${() => this.newProjectDialogState(true)}></mwc-button>
                    ` : ""}
                </div>
                <div id="app-content" slot="appContent">
                    <slot></slot>
                </div>
            </mwc-drawer-fixed>

            ${!isNewDesign() ? html`
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
            ` : ""}
        `;
    }

    private newProjectDialog = createRef<Dialog>();
    private newProjectNameField = createRef<TextField>();

    private getDynamicList(): Item[] {
        // Returns list of project in legacy design
        // And pinned scopes in new design
        if (isNewDesign()) return this.getScopes();
        return this.getProjectsList();
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

    private getProjectsList(): Item[] {
        const list = this.projects.map(v => ({
            label: v.label, link: `/project/${v.id}`, color: v.color, icon: "star",
        } as Item));
        list.push({ label: "None", link: "/project/none", color: "#dddddd", icon: "star" });
        return list;
    }

    private getItems(): Item[] {
        if (isNewDesign()) return [
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
        if (isNewDesign()) {
            this.dataListeners.push(Scope.listenForAll((scopes: Scope[]) => {
                this.scopes = scopes;
                this.pinnedScopes = scopes.filter(v => v.isPinned);
            }));
            return;
        }

        // Legacy
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
