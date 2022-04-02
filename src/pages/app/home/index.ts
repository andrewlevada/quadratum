import { CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { AppPageElement } from "~components/app/router/app-router";
import { getUserInfo } from "~src/models/user-service";
import Task from "~src/models/task";
import { getTaskById } from "~src/models/task/factory";
import scopedStyles from "./styles.lit.scss";
import getUpNextTasks, { getMoreUpNextTasks } from "~src/models/algo/up-next";
import { getTasksCompletedToday } from "~src/models/algo/home";

import("~components/app/tasks/tasks-card").then(f => f.default());
import("~components/app/tasks/task-item").then(f => f.default());
import("~components/common/card-surface").then(f => f.default());

@customElement("app-page--home")
export default class AppPageHome extends AppPageElement {
    @state() activeTask: Task | null = null;
    @state() upNextTasks: Task[] = [];
    @state() recommendedTasks: Task[] = [];
    @state() completedTasks: Task[] = [];

    render(): TemplateResult {
        return html`
            <div class="flex col gap app-page full-width">
                <h4>Your home</h4>
                
                <card-surface id="active-task-card" type="outlined">
                    ${this.activeTask ? html`
                        <task-item .task=${this.activeTask} displayType="active"></task-item>
                    ` : html`<p>No active task</p>`}
                </card-surface>
                
                <div class="wrapper">
                    <div class="flex col gap">
                        <h6>Up next</h6>
                        <tasks-card .tasks=${this.upNextTasks} displayType="pending"></tasks-card>
                        
                        <h6>Feel like doing something different?</h6>
                        <tasks-card .tasks=${this.recommendedTasks} displayType="pending"></tasks-card>
                    </div>

                    <div class="flex col gap">
                        <h6>Completed today</h6>
                        <tasks-card .tasks=${this.completedTasks} displayType="completed"></tasks-card>

                        <h6>Stay on track</h6>
                    </div>
                </div>
            </div>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...pageStyles, scopedStyles];
    }

    requestReload() {
        super.requestReload();
        getUserInfo().then(user => {
            if (!user.activeTaskId) return;
            getTaskById(user.activeTaskId).then(task => {
                this.activeTask = task;
            });
        });

        getUpNextTasks().then(tasks => {
            this.upNextTasks = tasks;
            if (tasks.length <= 3) getMoreUpNextTasks().then(moreTasks => {
                this.upNextTasks = [...this.upNextTasks, ...moreTasks];
            });
        });

        getTasksCompletedToday().then(tasks => {
            this.completedTasks = tasks;
        });
    }
}
