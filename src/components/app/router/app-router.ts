import { css, CSSResultGroup, html, LitElement, PropertyValues, TemplateResult } from "lit";
import { html as staticHtml, unsafeStatic } from "lit/static-html.js";
import { query, state } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent, RealtimeLitElement } from "~utils/components";
import { Unsubscribe } from "@firebase/firestore";

import("~components/app/create-task-fab").then(f => f.default());

interface PageInfo {
    tag: string;
    importPath?: string;
}

export abstract class AppPageElement extends RealtimeLitElement {
    public requestReload(): void { }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.requestReload();
    }
}

export default (): void => defineComponent("app-router", AppRouter);
export class AppRouter extends LitElement {
    @state() page: PageInfo | null = null;
    @state() withSidebar: boolean = false;

    @query("#page-element") pageElement!: AppPageElement;
    @query("side-bar") sideBarElement!: LitElement;

    private static memoryLeak: AppRouter;

    render(): TemplateResult {
        if (!this.page) return html``;

        const tag = unsafeStatic(`app-page--${this.page.tag}`);
        return this.withSidebar ? html`
            <side-bar .pageTag=${this.page.tag}>${staticHtml`
                <${tag} id="page-element"></${tag}>
               `}
                <create-task-fab></create-task-fab>
            </side-bar>
        ` : staticHtml`
            <${tag} id="page-element"></${tag}>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        this.updatePage();
        AppRouter.memoryLeak = this;
    }

    private updatePage(): void {
        const newPage = this.choosePage();
        if (this.page && this.page.tag === newPage.tag) {
            this.pageElement.requestReload();
            this.sideBarElement.requestUpdate();
            return;
        }

        this.page = newPage;

        // This has to be here until esbuild will do something about this
        // https://github.com/evanw/esbuild/issues/700
        import(`../../../pages${this.page.importPath || ""}/${this.page.tag}/index.js`).then().catch();
        if (this.withSidebar) import("~components/app/side-bar").then(f => f.default());
    }

    private choosePage(): PageInfo {
        const path = window.location.pathname;

        if (path === "/enter") return { tag: "enter" };
        if (path === "/") return { tag: "landing" };

        this.withSidebar = path.startsWith("/app");
        if (path === "/app") return { tag: "home", importPath: "/app" };
        if (path === "/app/map") return { tag: "map", importPath: "/app" };
        if (path.startsWith("/app/scope/")) return { tag: "scope", importPath: "/app" };

        // Legacy
        if (path === "/app/daily") return { tag: "daily", importPath: "/app" };
        if (path.startsWith("/app/sprint/")) return { tag: "sprint", importPath: "/app" };
        if (path.startsWith("/app/project/")) return { tag: "project", importPath: "/app" };

        return { tag: "not-found" };
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          :host {
            background-color: var(--md-sys-color-background);
            color: var(--mdc-theme-on-surface);
            width: 100%;
            height: 100%;
            display: block;
          }
        `];
    }

    public static goTo(href: string): void {
        window.history.pushState(null, "Quadratum", href);
        AppRouter.memoryLeak.updatePage();
    }
}
