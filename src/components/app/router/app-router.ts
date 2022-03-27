// eslint-disable-next-line max-classes-per-file
import { css, CSSResultGroup, LitElement, PropertyValues, TemplateResult } from "lit";
import { html, unsafeStatic } from "lit/static-html.js";
import { query, state } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";

interface PageInfo {
    tag: PageTag;
    importPath?: string;
}

type PageTag = "landing" | "enter" | "sprint" | "daily" | "project" | "not-found";

export abstract class AppPageElement extends LitElement {
    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-empty-function
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

    render(): TemplateResult {
        if (!this.page) return html``;

        const tag = unsafeStatic(`app-page--${this.page.tag}`);
        return this.withSidebar ? html`
            <side-bar>
                <${tag} id="page-element"></${tag}>
            </side-bar>
        ` : html`
            <${tag} id="page-element"></${tag}>
        `;
    }

    connectedCallback() {
        super.connectedCallback();
        this.updatePage();
        window.addEventListener("history_push", () => this.updatePage());
    }

    private updatePage(): void {
        const newPage = this.choosePage();
        if (this.page && this.page.tag === newPage.tag) {
            this.pageElement.requestReload();
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
        if (path === "/app/daily") return { tag: "daily", importPath: "/app" };
        if (path.startsWith("/app/sprint/")) return { tag: "sprint", importPath: "/app" };
        if (path.startsWith("/app/project/")) return { tag: "project", importPath: "/app" };

        return { tag: "not-found" };
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles, css`
          width: 100%;
          height: 100%;
        `];
    }
}
