import { CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { AppPageElement } from "~components/app/router/app-router";
import { listenForUserInfo, setActiveTask } from "~src/models/user-service";
import Task from "~src/models/task";
import { getTaskById } from "~src/models/task/factory";
import scopedStyles from "./styles.lit.scss";
import { listenForTasksCompletedToday } from "~src/models/algo/home";
import listenForUpNextTasks from "~src/models/algo/up-next";
import { getAuth, onAuthStateChanged } from "@firebase/auth";

@customElement("app-page--map")
export default class AppPageMap extends AppPageElement {
    @state() figmaAuthUrl: string | null = null;

    render(): TemplateResult {
        return html`
            <div class="flex col gap app-page full-width">
                <h3>To start allow access to your Figma account</h3>
                <h4>This is needed to fetch data from your life map in FigJam</h4>
                
                ${this.figmaAuthUrl ? html`
                    <a href=${this.figmaAuthUrl}>Allow access to Figma</a>
                ` : ""}
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        onAuthStateChanged(getAuth(), user => {
            if (!user) return;
            this.figmaAuthUrl = this.getFigmaAuthUrl(user.uid);
        });
    }

    private getFigmaAuthUrl(userId: string): string {
        let url = "https://www.figma.com/oauth?";
        url += "client_id=94adIFIRtHc5SOrpwKBbpL&";
        url += "redirect_uri=https://quadratum-app.web.app/app/map&";
        url += "scope=file_read&";
        url += `state=${userId}&`;
        url += "response_type=code";
        return url;
    }

    static get styles(): CSSResultGroup {
        return [...pageStyles, scopedStyles];
    }
}
