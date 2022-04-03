import { deleteField, doc, DocumentReference, Firestore, getFirestore } from "@firebase/firestore";

export function db(): Firestore {
    return getFirestore();
}

export function userId(): string | null {
    return localStorage.getItem("fb_user_uid") || null;
}

export function userDoc(): DocumentReference {
    const id = userId();
    if (id === null) {
        window.location.pathname = "/enter";
        throw new Error("User not authed! [Sentry ignore]");
    }
    return doc(db(), "users", id);
}

export function nullishPayloadSet<T>(field: keyof T, o: Partial<T>, payload: any): void {
    if (o[field] === undefined) return;
    if (o[field] === null) payload[field as keyof T] = deleteField();
    else (payload as Record<string, unknown>)[field as string] = o[field];
}

type PartialWithId<T> = Partial<T> & { id: string };
type Convertor = "string" | "number" | "boolean" | "null";
export function updatable<T>(updateFunction: (data: PartialWithId<T>) => Promise<void>, type?: Convertor, additionalPayload?: Partial<T>) {
    return (target: Object, key: string) => {
        const privateKey = `${key}Inner`;

        const getter = function() {
            if (type === "string") return this[privateKey] || "";
            if (type === "number") return this[privateKey] || 0;
            if (type === "boolean") return !!this[privateKey];
            if (type === "null") return this[privateKey] || null;
            return this[privateKey];
        }

        const setter = function (value: unknown) {
            if (value === this[privateKey]) return;
            this[privateKey] = value;

            const payload: Record<string, unknown> = additionalPayload || {};
            payload[key] = value;
            updateFunction({ ...(payload as Partial<T>), id: this.id }).then();
        }

        delete (target as any)[key];
        Object.defineProperty(target, key, { get: getter, set: setter });
    }
}
