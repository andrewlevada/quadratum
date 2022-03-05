import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property, state } from "lit/decorators.js";
import Task from "~services/task";
import List from "~services/list";
import scopedStyles from "./styles.module.scss";

export default (): void => defineComponent("tasks-table", TasksTable);
export class TasksTable extends LitElement {
    @property() listId!: string;
    @state() tasks: Task[] | null = null;

    render(): TemplateResult {
        return html`
            <p>Tasks Table</p>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        if (!this.listId) throw new Error("tasks-table requires property listId, but it's not set");
        List.fromId(this.listId).then(list => list.tasks()).then(value => {
            this.tasks = value;
        });
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles as never];
    }
}
