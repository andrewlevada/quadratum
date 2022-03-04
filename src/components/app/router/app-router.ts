import { CSSResultGroup, LitElement, TemplateResult } from "lit";
import { html, unsafeStatic } from "lit/static-html.js";
import { state } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";

type PageTag = "sprint" | "daily" | "not-found";

export default (): void => defineComponent("app-router", AppRouter);
export class AppRouter extends LitElement {
    @state() pageTag: PageTag | null = null;

    render(): TemplateResult {
        const tag = unsafeStatic(`app-page--${this.pageTag}`);
        return this.pageTag ? html`
            <${tag}></${tag}>
        ` : html``;
    }

    connectedCallback() {
        super.connectedCallback();
        this.pageTag = AppRouter.choosePageTag();
        import(`~src/pages/app/${this.pageTag}`);
    }

    private static choosePageTag(): PageTag {
        const path = window.location.pathname;
        if (path === "/daily") return "daily";
        if (path.startsWith("/sprint/")) return "sprint";
        return "not-found";
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles];
    }
}
