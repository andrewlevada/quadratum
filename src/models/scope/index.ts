import {
    DocumentData,
    FirestoreDataConverter,
    PartialWithFieldValue,
    QueryDocumentSnapshot,
    WithFieldValue
} from "@firebase/firestore";
import { nullishPayloadSet, updatable } from "~src/models/tools";
import { FullPartial } from "~utils/types";
import { updateTask } from "~src/models/task/data";

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
    @updatable() label!: string;

    private parentIdsInner: string[];
    @updatable() parentIds!: string[];

    private symbolInner?: string;
    @updatable() symbol!: string | null;

    private isPinnedInner?: boolean;
    @updatable() isPinned!: boolean;

    private isArchivedInner?: boolean;
    @updatable() isArchived!: boolean;

    constructor(id: string, document: ScopeDocument) {
        this.id = id;
        this.labelInner = document.label;
        this.parentIdsInner = document.parentIds;
        this.symbolInner = document.symbol;
        this.isPinnedInner = document.isPinned;
        this.isArchivedInner = document.isArchived;
    }

    public edit(data: FullPartial<Scope>): Promise<void> {
        for (const field of Object.keys(data))
            if (`${field}Inner` in this)
                (this as Record<string, unknown>)[`${field}Inner`] = (data as Record<string, unknown>)[field];
        return updateTask({ ...data, id: this.id as string });
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
