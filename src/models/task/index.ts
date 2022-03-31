import { deleteTask, fetchTasksWithFilter, updateTask } from "~src/models/task/data";
import { getSprintAnchorSync } from "~src/models/user-service";
import { deleteField,
    DocumentData,
    FirestoreDataConverter,
    PartialWithFieldValue, QueryDocumentSnapshot, where,
    WithFieldValue } from "@firebase/firestore";
import { TaskContextModifier } from "~src/models/task/task-context-modifier";
import TaskState from "~src/models/task/states";
import NormalState from "~src/models/task/states/normal";
import CompletedState from "~src/models/task/states/completed";

export type TaskConstructionData = BaseTaskDocument | Task | Partial<Task>;

export interface BaseTaskDocument {
    text: string;
    isCompleted: boolean;
    sessions: number;
    parentTaskId?: string;

    // Legacy
    projectId?: string;
    sprintNumber?: number;
    isInDaily?: boolean;
}

export type PendingTaskDocument = BaseTaskDocument & PendingTaskDocumentPart;
export interface PendingTaskDocumentPart {
    progress?: boolean[] | null;
}

export type CompletedTaskDocument = BaseTaskDocument & PendingTaskDocumentPart;
// eslint-disable-next-line
export interface CompletedTaskDocumentPart {
    // For future use
}

export default class Task {
    public readonly id: string;

    private state: TaskState;

    private textInner: string | undefined;
    public get text(): string {
        return this.textInner || "";
    }
    public set text(value: string) {
        if (this.textInner === value) return;
        this.textInner = value;
        updateTask({ id: this.id, text: value }).then();
    }

    public get isCompleted(): boolean {
        return this.state.isCompleted;
    }

    private sessionsInner: number;
    public get sessions(): number {
        return this.sessionsInner;
    }
    public set sessions(value: number) {
        if (this.sessionsInner === value) return;
        this.sessionsInner = value;
        updateTask({ id: this.id, sessions: this.sessionsInner }).then();
    }

    private parentTaskIdInner: string | undefined;
    public get parentTaskId(): string | undefined {
        return this.parentTaskIdInner;
    }
    public set parentTaskId(value: string | undefined) {
        if (this.parentTaskIdInner === value) return;
        this.parentTaskIdInner = value;
        updateTask({ id: this.id, parentTaskId: value }).then();
    }

    public setState(value: TaskState) {
        this.state = value;
    }
    public get progress(): boolean[] | null {
        return this.state.progress;
    }
    public updateProgress(value: boolean[] | null): Promise<void> {
        return this.state.updateProgress(value);
    }

    public constructor(id: string, data: TaskConstructionData) {
        this.id = id;
        this.textInner = data.text;
        this.sessionsInner = data.sessions || 0;
        this.parentTaskIdInner = data.parentTaskId;

        this.state = data.isCompleted ? new CompletedState(this, data) : new NormalState(this, data);

        // Legacy
        this.projectIdInner = data.projectId;
        this.sprintNumberInner = data.sprintNumber;
        this.isInDailyInner = !!data.isInDaily;
    }

    public modifier(group: Task[]): TaskContextModifier {
        return new TaskContextModifier(this, group);
    }

    public delete(): Promise<void> {
        return deleteTask(this.id);
    }

    public edit(data: Partial<Task | PendingTaskDocumentPart | CompletedTaskDocumentPart>): Promise<void> {
        for (const field of Object.keys(data))
            if (`${field}Inner` in this)
                (this as Record<string, unknown>)[`${field}Inner`] = (data as Record<string, unknown>)[field];
        return updateTask({ id: this.id, ...data });
    }

    public static converter: FirestoreDataConverter<Task> = {
        fromFirestore(snap: QueryDocumentSnapshot): Task {
            return new Task(snap.id, snap.data());
        },

        toFirestore(modelObject: WithFieldValue<Task> | PartialWithFieldValue<Task>): DocumentData {
            const o = modelObject as Partial<Task & PendingTaskDocumentPart & CompletedTaskDocumentPart>;
            const payload: PartialWithFieldValue<PendingTaskDocument | CompletedTaskDocument> = {};

            if (o.text !== undefined) payload.text = o.text;
            if (o.sessions !== undefined) payload.sessions = o.sessions;
            if (o.parentTaskId !== undefined) payload.parentTaskId = o.parentTaskId;
            if (o.isCompleted !== undefined) payload.isCompleted = o.isCompleted;

            if (o.progress !== undefined)
                if (o.progress === null) payload.progress = deleteField();
                else payload.progress = o.progress;

            // Legacy
            if (o.projectId !== undefined) payload.projectId = o.projectId || deleteField();
            if (o.isInDaily !== undefined) payload.isInDaily = o.isInDaily;

            if (o.sprintNumber === null) payload.sprintNumber = deleteField();
            else if (o.sprintNumber !== undefined) payload.sprintNumber = o.sprintNumber;

            return payload;
        },
    };

    // Legacy

    private isInDailyInner: boolean;
    public get isInDaily(): boolean {
        return this.isInDailyInner;
    }
    public set isInDaily(value: boolean) {
        if (this.isInDailyInner === value) return;
        this.isInDailyInner = value;
        updateTask({ id: this.id, isInDaily: value, sprintNumber: getSprintAnchorSync().currentSprintNumber }).then();
    }

    private projectIdInner: string | null | undefined;
    public get projectId(): string | null {
        return this.projectIdInner!;
    }
    public set projectId(value: string | null) {
        if (this.projectIdInner === value) return;
        this.projectIdInner = value;
        updateTask({ id: this.id, projectId: value }).then();
    }

    private sprintNumberInner: number | null | undefined;
    public get sprintNumber(): number | null {
        return this.sprintNumberInner!;
    }
    public set sprintNumber(value: number | null) {
        if (this.sprintNumberInner === value) return;
        this.sprintNumberInner = value;
        updateTask({ id: this.id, sprintNumber: value, isInDaily: false }).then();
    }

    public static daily(): Promise<Task[]> {
        return fetchTasksWithFilter(where("isInDaily", "==", true));
    }
}
