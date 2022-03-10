import { deleteTask,
    fetchTaskById,
    fetchTasksByIds,
    fetchTasksWithFilter,
    postTask,
    updateTask } from "~services/task/data";
import { deleteField, DocumentData,
    FirestoreDataConverter,
    PartialWithFieldValue,
    QueryDocumentSnapshot, where,
    WithFieldValue } from "@firebase/firestore";
import { getCurrentSprintNumber } from "~services/sprint/data";

export type ActionOrigin = "daily" | "sprint" | "backlog";

export interface ActionContext {
    origin: ActionOrigin;
}

export interface CreationContext extends ActionContext {
    projectId: string | null;
    sprintNumber: number | null;
}

interface TaskDocument {
    text: string;
    projectId?: string;
    sprintNumber?: number;
    isInDaily?: boolean;
    progress?: boolean[];
}

export default class Task {
    public readonly id: string;

    private textInner: string;
    public get text(): string {
        return this.textInner;
    }
    public set text(value: string) {
        this.textInner = value;
        updateTask({ id: this.id, text: value }).then();
    }

    private isInDailyInner: boolean;
    public get isInDaily(): boolean {
        return this.isInDailyInner;
    }
    public set isInDaily(value: boolean) {
        this.isInDailyInner = value;
        updateTask({ id: this.id, isInDaily: value }).then();
    }

    private projectIdInner: string | null;
    public get projectId(): string | null {
        return this.projectIdInner;
    }
    public set projectId(value: string | null) {
        this.projectIdInner = value;
        updateTask({ id: this.id, projectId: value }).then();
    }

    private sprintNumberInner: number | null;
    public get sprintNumber(): number | null {
        return this.sprintNumberInner;
    }
    public set sprintNumber(value: number | null) {
        this.sprintNumberInner = value;
        updateTask({ id: this.id, sprintNumber: value }).then();
    }

    private progressInner: boolean[] | null;
    public get progress(): boolean[] | null {
        return this.progressInner;
    }

    constructor(id: string, data: TaskDocument | Task) {
        this.id = id;
        this.textInner = data.text;
        this.projectIdInner = data.projectId || null;
        this.sprintNumberInner = data.sprintNumber !== undefined ? data.sprintNumber : null;
        this.isInDailyInner = !!data.isInDaily;
        this.progressInner = data.progress || null;
    }

    public delete(): Promise<void> {
        return deleteTask(this.id).then();
    }

    public updateProgress(value?: boolean[]): void {
        if (value !== undefined) this.progressInner = value;
        updateTask({ id: this.id, progress: this.progressInner }).then();
    }

    public static fromId(id: string): Promise<Task> {
        return fetchTaskById(id);
    }

    public static fromIds(ids: readonly string[]): Promise<Task[]> {
        return fetchTasksByIds(ids);
    }

    public static daily(): Promise<Task[]> {
        return fetchTasksWithFilter(where("isInDaily", "==", true));
    }

    public static noProject(): Promise<Task[]> {
        return fetchTasksWithFilter(where("projectId", "==", "none"));
    }

    public static async create(text: string, context: CreationContext): Promise<Task> {
        if (context.origin === "daily") context.sprintNumber = await getCurrentSprintNumber();
        return postTask(new Task("null", {
            text,
            projectId: context.projectId || "none",
            sprintNumber: typeof context.sprintNumber === "number" ? context.sprintNumber : undefined,
            isInDaily: context.origin === "daily",
            progress: [false],
        }));
    }

    public static converter: FirestoreDataConverter<Task> = {
        fromFirestore(snap: QueryDocumentSnapshot): Task {
            return new Task(snap.id, snap.data() as TaskDocument);
        },

        toFirestore(modelObject: WithFieldValue<Task> | PartialWithFieldValue<Task>): DocumentData {
            const o = modelObject as Partial<Task>;
            const payload: PartialWithFieldValue<TaskDocument> = {};

            if (o.text) payload.text = o.text;
            if (o.projectId) payload.projectId = o.projectId;
            if (typeof o.sprintNumber === "number") payload.sprintNumber = o.sprintNumber;
            if (o.isInDaily) payload.isInDaily = true;
            if (o.progress === null) payload.progress = deleteField();
            else if (o.progress) payload.progress = o.progress as boolean[];
            return payload;
        },
    };
}

// export interface ParentTask extends Task {
//     subtasksIds: string[];
// }
//
// export interface PointsTask extends Task {
//     points: boolean[];
// }
