import { CSSResultGroup, html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { AppPageElement } from "~components/app/router/app-router";
import { getUserInfo, listenForUserInfo, OAuthData, setActiveTask, setFigmaOAuth } from "~src/models/user-service";
import Task from "~src/models/task";
import { getTaskById } from "~src/models/task/factory";
import scopedStyles from "./styles.lit.scss";
import { listenForTasksCompletedToday } from "~src/models/algo/home";
import listenForUpNextTasks from "~src/models/algo/up-next";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { generateFigmaOAuthToken } from "~services/figma";

@customElement("app-page--map")
export default class AppPageMap extends AppPageElement {
    @state() figmaAuthUrl: string | null = null;
    @state() state: "auth" | "pick_file" | "board" | null = null;

    private figmaOAuth: OAuthData | null = null;

    render(): TemplateResult {
        return html`
            <div class="flex col gap app-page full-width">
                ${this.state === "auth" ? html`
                    <div class="flex col gap big-gap">
                        <h4>To start allow access to your Figma account</h4>
                        <p>This is needed to fetch data from your life map in FigJam</p>

                        ${this.figmaAuthUrl ? html`
                        <a href=${this.figmaAuthUrl}>Allow access to Figma</a>
                    ` : ""}
                    </div>
                ` : ""}

                ${this.state === "pick_file" ? html`
                    <h3>You are logged in! Now enter url of a life map file</h3>
                    <mwc-textfield label="FigJam file url" outlined></mwc-textfield>
                ` : ""}
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        getUserInfo().then(userInfo => {
            if (userInfo.figmaOAuth) {
                this.figmaOAuth = userInfo.figmaOAuth;
                this.state = "board";
            } else onAuthStateChanged(getAuth(), user => {
                if (!user) return;

                if (window.location.search.includes("code=")) {
                    this.state = "pick_file";
                    const code = window.location.search.split("code=")[1].split("&")[0];
                    const state = window.location.search.split("state=")[1].split("&")[0];
                    if (state !== user.uid) return;
                    generateFigmaOAuthToken(code).then(data => {
                        setFigmaOAuth(data).then();
                        window.history.replaceState({}, document.title, "/app/map");
                    });
                } else {
                    this.state = "auth";
                    this.figmaAuthUrl = AppPageMap.getFigmaAuthUrl(user.uid);
                }
            });
        })
    }

    private static getFigmaAuthUrl(userId: string): string {
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
