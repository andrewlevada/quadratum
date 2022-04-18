import { db, nullishPayloadSet, updatable, userDoc } from "~src/models/tools";
import { Callback } from "~utils/types";
import {
    doc,
    DocumentData,
    FirestoreDataConverter,
    orderBy,
    PartialWithFieldValue,
    QueryDocumentSnapshot,
    runTransaction,
    Unsubscribe,
    WithFieldValue
} from "@firebase/firestore";
import { listenForMilestonesWithFilter, updateMilestone } from "~src/models/milestone/data";

export interface MilestoneDraft {
    label: string;
    description: string;
    startDate: number;
    dueDate: number;
}

export interface MilestoneDocument extends MilestoneDraft {
    totalSessions: number;
    completedSessions: number;
    isArchived?: boolean;
    isFinished?: boolean;
}

export default class Milestone {
    public readonly id: string;

    private labelInner: string;
    @updatable(updateMilestone) label!: string;

    private descriptionInner: string;
    @updatable(updateMilestone) description!: string;

    private startDateInner: number;
    @updatable(updateMilestone) readonly startDate!: number;

    private dueDateInner: number;
    @updatable(updateMilestone) dueDate!: number;

    private totalSessionsInner: number;
    @updatable(updateMilestone) readonly totalSessions!: number;

    private completedSessionsInner: number;
    @updatable(updateMilestone) readonly completedSessions!: number;

    private isArchivedInner?: boolean;
    @updatable(updateMilestone, "boolean") isArchived!: boolean;

    private isFinishedInner?: boolean;
    @updatable(updateMilestone, "boolean") isFinished!: boolean;

    constructor(id: string, document: MilestoneDocument) {
        this.id = id;
        this.labelInner = document.label;
        this.descriptionInner = document.description;
        this.startDateInner = document.startDate;
        this.dueDateInner = document.dueDate;
        this.totalSessionsInner = document.totalSessions;
        this.completedSessionsInner = document.completedSessions;
        this.isArchivedInner = document.isArchived;
        this.isFinishedInner = document.isFinished;
    }

    public static updateSessions(milestoneId: string, totalUpdate: number, completedUpdate: number) {
        runTransaction(db(), async transaction => {
            const milestone = await transaction.get(doc(userDoc(), "milestones", milestoneId));
            if (!milestone.exists()) return;
            const data = milestone.data() as MilestoneDocument;
            transaction.update(milestone.ref, {
                totalSessions: data.totalSessions + totalUpdate,
                completedSessions: data.completedSessions + completedUpdate,
            } as Partial<MilestoneDocument>);
        }).then();
    }

    public static listenForAll(callback: Callback<Milestone[]>): Unsubscribe {
        return listenForMilestonesWithFilter([orderBy("label")], callback);
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
            if (o.startDate !== undefined) payload.dueDate = o.startDate;
            if (o.dueDate !== undefined) payload.dueDate = o.dueDate;
            if (o.totalSessions !== undefined) payload.totalSessions = o.totalSessions;
            if (o.completedSessions !== undefined) payload.completedSessions = o.completedSessions;

            nullishPayloadSet<Milestone>("isArchived", o, payload);
            nullishPayloadSet<Milestone>("isFinished", o, payload);

            return payload;
        }
    };
}
