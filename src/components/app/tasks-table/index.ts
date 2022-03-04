import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property } from "lit/decorators.js";
import scopedStyles from "./styles.module.scss";

export default (): void => defineComponent("tasks-table", TasksTable);
export class TasksTable extends LitElement {
    @property() listId!: string;

    render(): TemplateResult {
        return html`
            <p>Tasks Table</p>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, scopedStyles as never];
    }
}
