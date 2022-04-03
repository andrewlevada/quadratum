import { deleteTask, fetchTasksWithFilter, updateTask } from "~src/models/task/data";
import { getSprintAnchorSync } from "~services/user";
import {
    DocumentData,
    FirestoreDataConverter,
    PartialWithFieldValue,
    QueryDocumentSnapshot,
    where,
    WithFieldValue
} from "@firebase/firestore";
import { TaskContextModifier } from "~src/models/task/task-context-modifier";
import TaskState, { TaskStateBehaviour } from "~src/models/task/states";
import PendingState from "~src/models/task/states/pending";
import CompletedState from "~src/models/task/states/completed";
import { FullPartial } from "~src/utils/types";
import { nullishPayloadSet, updatable } from "~src/models/tools";

export interface BaseTaskDocument {
    text: string;
    isCompleted: boolean;
    sessions: number;
    scope: ScopeReference;
    parentTaskId?: string;
    dueDate?: number;

    // Legacy
    projectId?: string;
    sprintNumber?: number;
    isInDaily?: boolean;
}

export interface ScopeReference {
    id: string | "pile";
    location: string;
}

export type PendingTaskDocument = BaseTaskDocument & PendingTaskDocumentPart;
export interface PendingTaskDocumentPart {
    progress?: boolean[] | null;
    wasActive?: boolean;
    upNextBlockTime?: number;
}

export type CompletedTaskDocument = BaseTaskDocument & CompletedTaskDocumentPart;
// eslint-disable-next-line
export interface CompletedTaskDocumentPart {
    isInHome?: boolean;
}

export type TaskDocument = PendingTaskDocument & CompletedTaskDocument;

export default class Task extends TaskStateBehaviour {
    public readonly id: string;

    private state: TaskState;

    private textInner: string;
    @updatable(updateTask) text!: string;

    private sessionsInner: number;
    @updatable(updateTask) sessions!: number;

    private scopeInner: ScopeReference;
    @updatable(updateTask) scope!: ScopeReference;

    private parentTaskIdInner?: string;
    @updatable(updateTask, "null") parentTaskId!: string | null;

    private dueDateInner?: number;
    @updatable(updateTask, "null") dueDate!: number | null;

    // State

    public getState(): TaskState {
        return this.state;
    }

    public setState(value: TaskState) {
        this.state = value;
    }

    public get isCompleted(): boolean {
        return this.state.isCompleted;
    }

    @forwardState() progress!: boolean[];
    @forwardState() wasActive!: boolean;
    @forwardState() upNextBlockTime!: number | null;
    @forwardState() isInHome!: boolean;

    public constructor(id: string, data: PendingTaskDocument & CompletedTaskDocument) {
        super();
        this.id = id;

        this.textInner = data.text;
        this.scopeInner = data.scope;
        this.sessionsInner = data.sessions;

        this.parentTaskIdInner = data.parentTaskId;
        this.dueDateInner = data.dueDate;

        this.state = data.isCompleted ? new CompletedState(this, data) : new PendingState(this, data);

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

    public edit(data: FullPartial<Task>): Promise<void> {
        for (const field of Object.keys(data))
            if (`${field}Inner` in this)
                (this as Record<string, unknown>)[`${field}Inner`] = (data as Record<string, unknown>)[field];
        return updateTask({ ...data, id: this.id as string });
    }

    public static converter: FirestoreDataConverter<Task> = {
        fromFirestore(snap: QueryDocumentSnapshot): Task {
            return new Task(snap.id, snap.data() as BaseTaskDocument);
        },

        toFirestore(modelObject: WithFieldValue<Task> | PartialWithFieldValue<Task>): DocumentData {
            const o = modelObject as Partial<Task>;
            const payload: PartialWithFieldValue<TaskDocument> = {};

            if (o.text !== undefined) payload.text = o.text;
            if (o.scope !== undefined) payload.scope = o.scope;
            if (o.sessions !== undefined) payload.sessions = o.sessions;
            if (o.isCompleted !== undefined) payload.isCompleted = o.isCompleted;

            nullishPayloadSet<Task>("parentTaskId", o, payload);
            nullishPayloadSet<Task>("dueDate", o, payload);
            nullishPayloadSet<Task>("progress", o, payload);
            nullishPayloadSet<Task>("wasActive", o, payload);
            nullishPayloadSet<Task>("upNextBlockTime", o, payload);
            nullishPayloadSet<Task>("isInHome", o, payload);

            // For extra protection
            if (o.sessions !== undefined && o.progress)
                if (o.sessions !== o.progress.length) payload.sessions = o.progress.length;

            // Legacy
            nullishPayloadSet<Task>("projectId", o, payload);
            nullishPayloadSet<Task>("isInDaily", o, payload);
            nullishPayloadSet<Task>("sprintNumber", o, payload);

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
        return fetchTasksWithFilter([where("isInDaily", "==", true)]);
    }
}

function forwardState() {
    return (target: Task, key: string) => {
        const getter = function() {
            return (this.getState() as unknown as Record<string, unknown>)[key];
        }

        const setter = function (value: unknown) {
            (this.getState() as unknown as Record<string, unknown>)[key] = value;
        }

        delete (target as any)[key];
        Object.defineProperty(target, key, { get: getter, set: setter });
    }
}
