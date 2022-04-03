import { updateScope } from "~src/models/scope/data";
import {
    DocumentData,
    FirestoreDataConverter,
    PartialWithFieldValue,
    QueryDocumentSnapshot,
    WithFieldValue
} from "@firebase/firestore";
import { nullishPayloadSet } from "~src/models/tools";

export interface ScopeDocument {
    label: string;
    parentIds: (string | "root")[];
    symbol?: string;
    isPinned?: boolean;
}

export default class Scope {
    public readonly id: string;

    private labelInner: string;
    @updatable() label!: string;

    private parentIdsInner: string[];
    @updatable() parentIds!: string[];

    private symbolInner: string | null;
    @updatable() symbol!: string | null;

    private isPinnedInner: boolean | null;
    @updatable() isPinned!: boolean;

    constructor(id: string, document: ScopeDocument) {
        this.id = id;
        this.labelInner = document.label;
        this.parentIdsInner = document.parentIds;
        this.symbolInner = document.symbol || null;
        this.isPinnedInner = document.isPinned || null;
    }

    public static converter: FirestoreDataConverter<Scope> = {
        fromFirestore(snap: QueryDocumentSnapshot): Scope {
            return new Scope(snap.id, snap.data() as ScopeDocument);
        },

        toFirestore(modelObject: WithFieldValue<Scope> | PartialWithFieldValue<Scope>): DocumentData {
            const o = modelObject as Partial<Scope>;
            const payload: Partial<ScopeDocument> = {};

            if (o.label !== undefined) payload.label = o.label;
            if (o.parentIds !== undefined) payload.parentIds = o.parentIds;

            nullishPayloadSet<Scope>("symbol", o, payload);
            nullishPayloadSet<Scope>("isPinned", o, payload);

            return payload;
        },
    };
}

function updatable(additionalPayload?: Partial<Scope>) {
    return (target: Object, key: string) => {
        const privateKey = `${key}Inner`;

        const getter = function() {
            return this[privateKey];
        }

        const setter = function (value: unknown) {
            if (value === this[privateKey]) return;
            this[privateKey] = value;

            const payload: Record<string, unknown> = additionalPayload || {};
            payload[key] = value;
            updateScope({ ...(payload as Partial<Scope>), id: this.id }).then();
        }

        delete (target as any)[key];
        Object.defineProperty(target, key, { get: getter, set: setter });
    }
}
