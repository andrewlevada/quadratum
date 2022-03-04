export {};

declare global {
    interface Array<T> {
        last(): T;
    }

    interface HTMLElement {
        dispatchSimpleEvent(name: string, value?: unknown): void;
    }
}