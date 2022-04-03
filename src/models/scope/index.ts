import {
    DocumentData,
    FirestoreDataConverter,
    PartialWithFieldValue,
    QueryDocumentSnapshot,
    Unsubscribe,
    where,
    WithFieldValue
} from "@firebase/firestore";
import { nullishPayloadSet, updatable } from "~src/models/tools";
import { Callback, FullPartial } from "~utils/types";
import { updateTask } from "~src/models/task/data";
import { listenForScopesWithFilter, updateScope } from "~src/models/scope/data";

export interface ScopeDocument {
    label: string;
    parentIds: (string | "root")[];
    symbol?: string;
    isPinned?: boolean;
    isArchived?: boolean;
}

export interface ScopeDraft extends ScopeDocument {
    id: string;
}

export default class Scope {
    public readonly id: string;

    private labelInner: string;
    @updatable(updateScope) label!: string;

    private parentIdsInner: string[];
    @updatable(updateScope) parentIds!: string[];

    private symbolInner?: string;
    @updatable(updateScope, "null") symbol!: string | null;

    private isPinnedInner?: boolean;
    @updatable(updateScope, "boolean") isPinned!: boolean;

    private isArchivedInner?: boolean;
    @updatable(updateScope, "boolean") isArchived!: boolean;

    constructor(id: string, document: ScopeDocument) {
        this.id = id;
        this.labelInner = document.label;
        this.parentIdsInner = document.parentIds;
        this.symbolInner = document.symbol;
        this.isPinnedInner = document.isPinned;
        this.isArchivedInner = document.isArchived;
    }

    public edit(data: Partial<Scope>): Promise<void> {
        for (const field of Object.keys(data))
            if (`${field}Inner` in this)
                (this as Record<string, unknown>)[`${field}Inner`] = (data as Record<string, unknown>)[field];
        return updateScope({ ...data, id: this.id as string });
    }

    public static listenForPinned(callback: Callback<Scope[]>): Unsubscribe {
        return listenForScopesWithFilter([where("isPinned", "==", true)], callback);
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
            nullishPayloadSet<Scope>("isArchived", o, payload);

            return payload;
        },
    };
}
