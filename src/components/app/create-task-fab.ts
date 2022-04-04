import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";
import { property } from "lit/decorators.js";
import Task from "~src/models/task";
import { setActiveTask } from "~services/user";
import { timestampToRelativeString } from "~utils/time";

import("~components/overwrites/md-fab").then(f => f.default());

export default (): void => defineComponent("create-task-fab", CreateTaskFab);
export class CreateTaskFab extends LitElement {
    render(): TemplateResult {
        return html`
            <md-fab icon="mode_edit"></md-fab>
        `;
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          :host {
            position: fixed;
            width: 100vw;
            height: 100vh;
          }

          md-fab {
            position: fixed;
            bottom: 16px;
            right: 16px;
            z-index: 1;
          }
        `];
    }
}
