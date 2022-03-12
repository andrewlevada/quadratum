/* eslint-disable indent */
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { pageStyles } from "~src/global";
import Project from "~services/project";
import Task from "~services/task";
import "@material/mwc-button";
import "@material/mwc-dialog";
import "@material/mwc-textfield";
import "@material/mwc-icon-button";
import { Dialog } from "@material/mwc-dialog";
import { createRef, ref } from "lit/directives/ref.js";
import { TextField } from "@material/mwc-textfield";

import("~components/app/task-table").then(f => f.default());

@customElement("app-page--project")
export default class AppPageProject extends LitElement {
    @state() project: Project | null = null;
    @state() tasks: Task[] | null = null;
    @state() noneProject: boolean = false;

    render(): TemplateResult {
        return html`
            <div class="flex col app-page">
                <div class="flex row justify-between align-center full-width">
                    <h4>Project: ${this.project?.label || ""} ${this.project?.isArchived ? "(Archived)" : ""}</h4>
                    <mwc-icon-button icon="settings" @click=${() => this.openSettingsDialog()}></mwc-icon-button>
                </div>

                ${this.tasks ? html`
                    <task-table .tasks=${this.tasks} origin="backlog"
                                globalProjectId=${ifDefined(this.noneProject ? undefined : this.project!.id)}></task-table>
                ` : ""}
            </div>
            
            <mwc-dialog heading="Project Settings" ${ref(this.settingsDialog)}>
                <div class="flex col gap">
                    <mwc-textfield label="Label" .value=${this.project?.label || ""}
                                   ${ref(this.projectLabelTextfield)}></mwc-textfield>
                    <!-- TODO: Color picker -->
                    
                    <mwc-button label="Archive" @click=${() => {
                        this.project!.isArchived = true;
                        this.closeSettingsDialog();
                        this.requestUpdate();
                    }}></mwc-button>
                </div>

                <mwc-button slot="primaryAction" @click=${() => {
                    this.project!.label = this.projectLabelTextfield.value!.value;
                    this.closeSettingsDialog();
                    this.requestUpdate();
                }}>Save</mwc-button>

                <mwc-button slot="secondaryAction" @click=${this.closeSettingsDialog}>
                    Cancel
                </mwc-button>
            </mwc-dialog>
        `;
    }

    private settingsDialog = createRef<Dialog>();
    private projectLabelTextfield = createRef<TextField>();

    connectedCallback() {
        super.connectedCallback();
        const projectId = window.location.pathname.split("/").last();

        if (projectId === "none") {
            this.noneProject = true;
            Task.noProject().then(tasks => {
                this.tasks = tasks;
            });
        } else Promise.all([Project.fromId(projectId), Project.tasks(projectId, false)])
            .then(([project, tasks]) => {
                this.project = project;
                this.tasks = tasks;
            });
    }

    private openSettingsDialog(): void {
        this.settingsDialog.value!.open = true;
    }

    private closeSettingsDialog(): void {
        this.settingsDialog.value!.open = false;
    }

    static get styles(): CSSResultGroup {
        return [...pageStyles, css``];
    }
}
