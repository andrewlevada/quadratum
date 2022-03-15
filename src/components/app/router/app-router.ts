// eslint-disable-next-line max-classes-per-file
import { CSSResultGroup, LitElement, TemplateResult } from "lit";
import { html, unsafeStatic } from "lit/static-html.js";
import { query, state } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";

type PageTag = "sprint" | "daily" | "project" | "not-found";

export abstract class AppPageElement extends LitElement {
    public abstract requestReload(): void;
}

export default (): void => defineComponent("app-router", AppRouter);
export class AppRouter extends LitElement {
    @state() pageTag: PageTag | null = null;

    @query("#page-element") pageElement!: AppPageElement;

    render(): TemplateResult {
        const tag = unsafeStatic(`app-page--${this.pageTag}`);
        return this.pageTag ? html`
            <${tag} id="page-element"></${tag}>
        ` : html``;
    }

    connectedCallback() {
        super.connectedCallback();
        this.updatePage();
        window.addEventListener("history_push", () => this.updatePage());
    }

    private updatePage(): void {
        this.pageTag = AppRouter.choosePageTag();
        import(`~src/pages/app/${this.pageTag}`).then(() => {
            this.pageElement.requestReload();
        });
    }

    private static choosePageTag(): PageTag {
        const path = window.location.pathname.split("/app")[1];
        if (path === "/daily") return "daily";
        if (path.startsWith("/sprint/")) return "sprint";
        if (path.startsWith("/project/")) return "project";
        return "not-found";
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles];
    }
}
