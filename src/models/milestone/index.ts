import { nullishPayloadSet, updatable } from "~src/models/tools";
import { updateScope } from "~src/models/scope/data";
import { Callback } from "~utils/types";
import {
    DocumentData,
    FirestoreDataConverter,
    orderBy, PartialWithFieldValue,
    QueryDocumentSnapshot,
    Unsubscribe,
    WithFieldValue
} from "@firebase/firestore";
import { listenForMilestonesWithFilter } from "~src/models/milestone/data";

export interface MilestoneDraft {
    label: string;
    description: string;
    dueDate: number;
}

export interface MilestoneDocument extends MilestoneDraft {
    totalSessions: number;
    completedSessions: number;
    isArchived?: boolean;
}

export default class Milestone {
    public readonly id: string;

    private labelInner: string;
    @updatable(updateScope) label!: string;

    private descriptionInner: string;
    @updatable(updateScope) description!: string;

    private dueDateInner: number;
    @updatable(updateScope) dueDate!: number;

    private totalSessionsInner: number;
    @updatable(updateScope) readonly totalSessions!: number;

    private completedSessionsInner: number;
    @updatable(updateScope) readonly completedSessions!: number;

    private isArchivedInner?: boolean;
    @updatable(updateScope, "boolean") isArchived!: boolean;

    constructor(id: string, document: MilestoneDocument) {
        this.id = id;
        this.labelInner = document.label;
        this.descriptionInner = document.description;
        this.dueDateInner = document.dueDate;
        this.totalSessionsInner = document.totalSessions;
        this.completedSessionsInner = document.completedSessions;
        this.isArchivedInner = document.isArchived;
    }

    public static listenForAll(callback: Callback<Milestone[]>): Unsubscribe {
        return listenForMilestonesWithFilter([orderBy("label")],
            (milestones: Milestone[]) => callback(milestones.filter(v => !v.isArchived)));
    }

    public static converter: FirestoreDataConverter<Milestone> = {
        fromFirestore(snapshot: QueryDocumentSnapshot): Milestone {
            return new Milestone(snapshot.id, snapshot.data() as MilestoneDocument);
        },

        toFirestore(modelObject: WithFieldValue<Milestone> | PartialWithFieldValue<Milestone>): DocumentData {
            const o = modelObject as Partial<Milestone>;
            const payload: Partial<MilestoneDocument> = {};

            if (o.label !== undefined) payload.label = o.label;
            if (o.description !== undefined) payload.description = o.description;
            if (o.dueDate !== undefined) payload.dueDate = o.dueDate;
            if (o.totalSessions !== undefined) payload.totalSessions = o.totalSessions;
            if (o.completedSessions !== undefined) payload.completedSessions = o.completedSessions;

            nullishPayloadSet<Milestone>("isArchived", o, payload);

            return payload;
        }
    };
}
