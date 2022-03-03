import { CSSResultGroup, LitElement, TemplateResult } from "lit";
import { html, unsafeStatic } from "lit/static-html.js";
import { state } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";

export default (): void => defineComponent("app-router", AppRouter);
export class AppRouter extends LitElement {
    @state() pageTag: "list" | null = null;

    render(): TemplateResult {
        const tag = unsafeStatic(`app-page--${this.pageTag}`);
        return this.pageTag ? html`
            <${tag}></${tag}>
        ` : html``;
    }

    connectedCallback() {
        super.connectedCallback();
        this.pageTag = "list";
        import(`~src/pages/app/${this.pageTag}`);
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles];
    }
}
