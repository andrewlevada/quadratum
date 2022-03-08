import { createNewSprint,
    fetchSprintByNumber,
    getCurrentSprintNumber } from "~services/sprint/data";
import { getSprintAnchor } from "~services/user-service";
import Task from "~services/task";
import { fetchTasksWithFilter } from "~services/task/data";
import { DocumentData,
    FirestoreDataConverter,
    PartialWithFieldValue,
    QueryDocumentSnapshot,
    where,
    WithFieldValue } from "@firebase/firestore";

interface SprintDocument {
    startWeek: number;
}

export default class Sprint {
    public readonly number: number;
    public readonly startWeek: number;

    constructor(number: number, data: Sprint | SprintDocument) {
        this.number = number;
        this.startWeek = data.startWeek;
    }

    public tasks(): Promise<Task[]> {
        return Sprint.tasks(this.number);
    }

    public static tasks(sprintNumber: number): Promise<Task[]> {
        return fetchTasksWithFilter(where("sprintNumber", "==", sprintNumber));
    }

    public static fromNumber(number: number): Promise<Sprint | null> {
        return fetchSprintByNumber(number);
    }

    public static async current(shift?: number): Promise<Sprint | null> {
        const currentSprintNumber = await getCurrentSprintNumber();
        const sprint = await this.fromNumber(currentSprintNumber + (shift || 0));
        if (sprint) return Promise.resolve(sprint);
        if ((shift || -1) > 0) return this.createAndAppend();
        return Promise.resolve(null);
    }

    public static async createAndAppend(): Promise<Sprint> {
        const anchor = await getSprintAnchor();
        return createNewSprint(new Sprint(anchor.lastSprintNumber + 1, {
            startWeek: anchor.currentSprintWeek + (anchor.lastSprintNumber - anchor.currentSprintNumber) + 1,
        }));
    }

    public static converter: FirestoreDataConverter<Sprint> = {
        fromFirestore(snap: QueryDocumentSnapshot): Sprint {
            const data = snap.data() as SprintDocument;
            return new Sprint(Number(snap.id), data);
        },

        toFirestore(modelObject: WithFieldValue<Sprint> | PartialWithFieldValue<Sprint>): DocumentData {
            const o = modelObject as Partial<Sprint>;
            const payload: Partial<SprintDocument> = {};

            if (o.startWeek) payload.startWeek = o.startWeek;

            return payload;
        },
    };
}
