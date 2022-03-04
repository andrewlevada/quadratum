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
