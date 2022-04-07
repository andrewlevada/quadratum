import { css, CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { pageStyles } from "~src/global";
import Project from "~src/models/legacy/project";
import Task from "~src/models/task";
import "@material/mwc-button";
import "@material/mwc-dialog";
import "@material/mwc-textfield";
import "@material/mwc-icon-button";
import { Dialog } from "@material/mwc-dialog";
import { createRef, ref } from "lit/directives/ref.js";
import { TextField } from "@material/mwc-textfield";
import { AppPageElement } from "~components/app/router/app-router";
import Scope from "~src/models/scope";
import { listenForTasksFromScope } from "~src/models/task/factory";

import("~components/app/tasks/task-table").then(f => f.default());

@customElement("app-page--scope")
export default class AppPageScope extends AppPageElement {
    @state() scope: Scope | null = null;
    @state() tasks: Task[] | null = null;

    render(): TemplateResult {
        return html`
            <div class="flex col app-page">
                <div class="flex row justify-between align-center full-width">
                    <div class="flex row align-center">
                        <span class="material-icons">${this.scope?.symbol || "star"}</span>
                        <h4>${this.scope?.label || ""} ${this.scope?.isArchived ? "(Archived)" : ""}</h4>
                    </div>
                </div>

                ${this.tasks && this.scope ? html`
                    <task-table .tasks=${this.tasks} .scope=${this.scope}></task-table>
                ` : ""}
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        const id = window.location.pathname.split("/").pop();
        if (!id) return;

        this.dataListeners.push(Scope.listen(id, scope => {
            this.scope = scope;
        }));

        this.dataListeners.push(listenForTasksFromScope(id, tasks => {
            this.tasks = tasks;
        }));
    }

    static get styles(): CSSResultGroup {
        return [...pageStyles, css`
          
        `];
    }
}
