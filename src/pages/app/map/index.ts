import { html, TemplateResult } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { pageStyles } from "~src/global";
import { AppPageElement } from "~components/app-container/router/app-router";
import { listenForUserInfo, OAuthData, setFigmaMapUrl, setFigmaOAuth } from "~services/user";
import scopedStyles from "./styles.lit.scss";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { generateFigmaOAuthToken, getScopesFromFigma } from "~services/figma";
import "@material/mwc-textfield";
import { TextField } from "@material/mwc-textfield";
import syncScopes from "~src/models/scope/sync";

import("~components/overwrites/md-button").then(f => f.default());

@customElement("app-page--map")
export default class AppPageMap extends AppPageElement {
    @state() state: "auth" | "board" | null = null;
    @state() syncState: "none" | "syncing" | "done" = "none";
    @state() figmaAuthUrl: string | null = null;
    @state() figmaMapUrl: string | null = null;

    private figmaOAuth: OAuthData | null = null;

    @query("#figma-display") figmaDisplayElement!: HTMLElement;

    render(): TemplateResult {
        return html`
            <div class="flex col gap big-gap app-page full-width">
                ${this.state === "auth" ? html`
                    <div class="flex col gap big-gap">
                        <h4>To start allow access to your Figma account</h4>
                        <p>This is needed to fetch data from your life map in FigJam</p>

                        ${this.figmaAuthUrl ? html`
                            <a href=${this.figmaAuthUrl}>
                                <md-button raised label="Allow access to Figma"></md-button>
                            </a>
                        ` : ""}
                    </div>
                ` : ""}

                ${this.state === "board" ? html`
                    <div class="flex row gap big-gap align-center full-width">
                        <mwc-textfield label="FigJam file url" outlined class="flex-grow"
                                       pattern="https:\\/\\/([\\w\\.-]+\\.)?figma.com\\/(file|proto)\\/([0-9a-zA-Z]{22,128})(?:\\/.*)?$"
                                       .value=${this.figmaMapUrl}
                                       @change=${(e: InputEvent) => {
                                           if (!(e.target as TextField).reportValidity()) return;
                                           setFigmaMapUrl((e.target as TextField).value).then();
                                       }}></mwc-textfield>

                        <md-button outlined icon="sync" ?disabled=${this.syncState !== "none"}
                                   .label=${this.syncState === "done" ? "Synced!" : "Sync scopes with life map"}
                                   @click=${() => this.syncLifeMap()}></md-button>
                    </div>
                ` : ""}

                <div id="figma-display">
                    ${this.state === "board" && this.figmaMapUrl ? html`
                        <iframe width=${this.figmaDisplayElement?.clientWidth}
                                height=${this.figmaDisplayElement?.clientHeight}
                                allowfullscreen
                                src="https://www.figma.com/embed?embed_host=quadratum&url=${this.figmaMapUrl}"/>
                    ` : ""}
                </div>
            </div>
        `;
    }

    connectedCallback() {
        super.connectedCallback();

        this.dataListeners.push(listenForUserInfo(userInfo => {
            if (userInfo.figmaOAuth) {
                this.state = "board";
                this.figmaOAuth = userInfo.figmaOAuth;
                this.figmaMapUrl = userInfo.figmaMapUrl || null;
            } else onAuthStateChanged(getAuth(), user => {
                if (!user) return;

                if (window.location.search.includes("code=")) {
                    const code = window.location.search.split("code=")[1].split("&")[0];
                    const state = window.location.search.split("state=")[1].split("&")[0];
                    if (state !== user.uid) return;
                    generateFigmaOAuthToken(code).then(data => {
                        this.state = "board";
                        this.figmaOAuth = data;
                        setFigmaOAuth(data).then();
                        window.history.replaceState({}, document.title, "/app/map");
                    });
                } else {
                    this.state = "auth";
                    this.figmaAuthUrl = AppPageMap.getFigmaAuthUrl(user.uid);
                }
            });
        }));
    }

    private syncLifeMap() {
        if (!this.figmaOAuth || !this.figmaMapUrl) return;
        this.syncState = "syncing";
        getScopesFromFigma(this.figmaMapUrl, this.figmaOAuth.accessToken).then(scopes => {
            console.log(scopes);
            syncScopes(scopes).then(() => {
                this.syncState = "done";
            });
        });
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

    static styles = [...pageStyles, scopedStyles];
}
