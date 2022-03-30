export {};

declare global {
    interface Array<T> {
        last(): T;
        clone(): Array<T>;
    }

    interface HTMLElement {
        dispatchSimpleEvent(name: string, value?: unknown): void;
    }

    interface Date {
        week(): number;
        absoluteDay(): number;
    }

    interface Window {
        dataLayer: unknown[];
        gtag: (...args: unknown[])=> void;
    }
}
