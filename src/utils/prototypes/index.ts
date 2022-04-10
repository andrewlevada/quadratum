Array.prototype.last = function
last() {
    return this[this.length - 1];
};

Array.prototype.clone = function
clone() {
    if (this.length === 0) return [];
    if (typeof this[0] === "object") return this.map((a: object) => ({ ...a }));
    return this.slice(0);
};

Array.prototype.unique = function
unique<T>(transform: (v: T) => string) {
    const [newArr, set] = [[] as T[], new Set<string>()];
    for (const item of this) {
        const key = transform(item);
        if (!set.has(key)) {
            newArr.push(item);
            set.add(key);
        }
    }
    return newArr;
};

HTMLElement.prototype.dispatchSimpleEvent = function
dispatchSimpleEvent(name: string, value?: unknown) {
    this.dispatchEvent(new CustomEvent(name, {
        bubbles: true,
        composed: true,
        ...(value !== undefined ? { detail: { value } } : {}),
    }));
};

Date.prototype.week = function
week() {
    // - 86400_ is for week start on monday
    return Math.floor((this.valueOf() + 345600_000 - 86400_000) / 604800_000);
};

Date.prototype.absoluteDay = function
absoluteDay() {
    return Math.floor(this.valueOf() / 86400000);
};
