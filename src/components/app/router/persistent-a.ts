import { CSSResultGroup, LitElement, TemplateResult } from "lit";
import { html } from "lit/static-html.js";
import { property } from "lit/decorators.js";
import { componentStyles } from "~src/global";
import { defineComponent } from "~utils/components";

export default (): void => defineComponent("persistent-a", PersistentAnchor);
export class PersistentAnchor extends LitElement {
    @property({ type: String }) href!: string;

    render(): TemplateResult {
        return html`<a @click=${this.onClick}><slot></slot></a>`;
    }

    private onClick(): void {
        window.history.pushState(null, "", `/app${this.href}`);
        window.dispatchEvent(new Event("history_push"));
    }

    static get styles(): CSSResultGroup {
        return [...componentStyles];
    }
}
