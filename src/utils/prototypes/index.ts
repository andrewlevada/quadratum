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
    return Math.floor((this.valueOf() + 345600000) / 604800000);
};
