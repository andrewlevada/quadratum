Array.prototype.last = function
last() {
    return this[this.length - 1];
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
