import { css, html, TemplateResult } from "lit";
import { TaskItem } from "~components/app/tasks/task-item/index";
import Task from "~src/models/task";

import("~components/app/tasks/task-table/sessions-adjuster").then(f => f.default());

export function taskItemActionsHtml(item: TaskItem): TemplateResult[] {
    const actions = [html`
        <div class="sessions flex row gap align-center">
            <span>Sessions</span>
            <sessions-adjuster .task=${item.task}></sessions-adjuster>
        </div>
    `, html`
        <mwc-list-item graphic="icon" @click=${() => {
            if (item.taskModifier) item.taskModifier.deleteTree();
            else item.task.delete().then();
        }}>
            <span>Delete task</span>
            <mwc-icon slot="graphic">delete</mwc-icon>
        </mwc-list-item>
    `];

    if (item.displayType === "active") actions.push(html`
        <mwc-list-item graphic="icon" @click=${() => {
            Task.setActive(null).then();
        }}>
            <span>Change to pending</span>
            <mwc-icon slot="graphic">dangerous</mwc-icon>
        </mwc-list-item>
    `);

    return actions;
}

export const taskItemActionsStyles = css`
  .sessions {
    height: 32px;
    padding-left: 16px;
    padding-right: 16px;
  }
`;
