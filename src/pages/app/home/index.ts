import { html, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { AppPageElement } from "~components/app-container/router/app-router";
import { listenForUserInfo } from "~services/user";
import Task from "~src/models/task";
import { getTaskById } from "~src/models/task/factory";
import scopedStyles from "./styles.lit.scss";
import { clearCompletedToday, listenForTasksCompletedToday } from "~src/services/algo/home";
import listenForUpNextTasks from "~src/services/algo/up-next";
import fireworks from "fireworks";

import("~components/tasks/tasks-card").then(f => f.default());
import("~components/tasks/task-item").then(f => f.default());
import("~components/common/card-surface").then(f => f.default());
import("~components/overwrites/md-button").then(f => f.default());

@customElement("app-page--home")
export default class AppPageHome extends AppPageElement {
    @state() activeTask: Task | null = null;
    @state() upNextTasks: Task[] = [];
    @state() recommendedTasks: Task[] = [];
    @state() completedTasks: Task[] = [];

    @query("#clear-button") clearButton!: HTMLElement;

    render(): TemplateResult {
        return html`
            <div class="flex col gap app-page full-width">
                <h4>Your home</h4>

                <card-surface id="active-task-card" type="outlined">
                    ${this.activeTask ? html`
                        <task-item .task=${this.activeTask} displayType="active"
                                   @taskChange=${() => {
                                       if (this.activeTask?.isCompleted) {
                                           Task.setActive(null).then();
                                           this.activeTask = null;
                                       }
                                   }}></task-item>
                    ` : html`<p>No active task</p>`}
                </card-surface>

                <div class="two-columns">
                    <div class="flex col gap">
                        <h6>Up next</h6>
                        <tasks-card .tasks=${this.upNextTasks.filter(t => t.id !== this.activeTask?.id)} displayType="pending"></tasks-card>

                        <div class="flex header">
                            <h6>Feel like doing something different?</h6>
                            <md-button label="Shuffle" icon="shuffle" outlined></md-button>
                        </div>
                        <tasks-card .tasks=${this.recommendedTasks} displayType="pending"></tasks-card>
                    </div>

                    <div class="flex col gap">
                        <div class="flex header">
                            <h6>Completed today</h6>
                            <md-button label="To the next day!" icon="clear_all" outlined id="clear-button"
                                       @click=${(e: MouseEvent) => this.onCompletedClear(e)}></md-button>
                        </div>

                        <tasks-card .tasks=${this.completedTasks} displayType="completed"></tasks-card>

                        <h6>Stay on track</h6>
                    </div>
                </div>
            </div>
        `;
    }

    private onCompletedClear(e: MouseEvent): void {
        fireworks({
            x: e.pageX, y: e.pageY,
            colors: ["#8ef1ff", "#cde7ec", "#d8e2ff", "#006874", "#4a6266", "#525e7d"],
            canvasWidth: 800, canvasHeight: 800,
            count: 50,
        });

        clearCompletedToday(this.completedTasks);
    }

    requestReload() {
        super.requestReload();

        this.dataListeners.push(listenForUserInfo(user => {
            if (!user.activeTaskId) return;
            getTaskById(user.activeTaskId).then(task => {
                this.activeTask = task;
            });
        }));

        this.dataListeners.push(...listenForUpNextTasks(tasks => {
            this.upNextTasks = tasks;
        }));

        this.dataListeners.push(listenForTasksCompletedToday(tasks => {
            this.completedTasks = tasks;
        }));
    }

    static styles = [...pageStyles, scopedStyles];
}
