export function defineComponent(tag: string, c: CustomElementConstructor): void {
    if (customElements.get(tag) === undefined) customElements.define(tag, c);
}

export type obj = Record<string, unknown> | null | undefined;

export function hasObjectChanged(value: obj, oldValue: obj): boolean {
    if (value === oldValue) return false;
    if (!value || !oldValue) return true;

    const entries: [string, unknown][] = Object.entries(value);
    const oldEntries: [string, unknown][] = Object.entries(oldValue);
    if (entries.length !== oldEntries.length) return true;

    for (const e of entries) {
        if (!(e[0] in oldValue)) return true;
        const old: unknown = oldValue[e[0]];
        if (typeof e[1] !== typeof old) return true;
        if (typeof old === "object") {
            if (hasObjectChanged(e[1] as obj, old as obj)) return true;
        } else if (old !== e[1]) return true;
    }

    return false;
}
